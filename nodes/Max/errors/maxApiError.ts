import { NodeApiError } from 'n8n-workflow';
import type { IDataObject, JsonObject, INode } from 'n8n-workflow';

interface MaxErrorRecord extends Record<string, unknown> {
	message?: unknown;
	code?: unknown;
	status?: unknown;
	statusCode?: unknown;
	response?: unknown;
	data?: unknown;
	body?: unknown;
}

const asRecord = (value: unknown): MaxErrorRecord | undefined => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined;
	}

	return value as MaxErrorRecord;
};

const getNestedErrorRecords = (error: unknown): MaxErrorRecord[] => {
	const root = asRecord(error);
	if (!root) {
		return [];
	}

	const nested = [
		root,
		asRecord(root.response),
		asRecord(root.data),
		asRecord(root.body),
		asRecord(asRecord(root.response)?.data),
		asRecord(asRecord(root.response)?.body),
	].filter((entry): entry is MaxErrorRecord => entry !== undefined);

	return nested;
};

const extractStringProperty = (records: MaxErrorRecord[], propertyName: string): string | undefined => {
	for (const record of records) {
		const value = record[propertyName];
		if (typeof value === 'string' && value.length > 0) {
			return value;
		}
	}

	return undefined;
};

const extractNumericProperty = (records: MaxErrorRecord[], propertyName: string): number | undefined => {
	for (const record of records) {
		const value = record[propertyName];
		if (typeof value === 'number' && Number.isFinite(value)) {
			return value;
		}
	}

	return undefined;
};

export interface MaxApiErrorDetails {
	message: string;
	code?: string;
	httpCode?: string;
	statusCode?: number;
}

export const extractMaxErrorCode = (error: unknown): string | undefined => {
	return extractStringProperty(getNestedErrorRecords(error), 'code');
};

export const extractMaxErrorMessage = (error: unknown): string => {
	if (error instanceof Error && error.message) {
		return error.message;
	}

	if (typeof error === 'string' && error.length > 0) {
		return error;
	}

	const nestedRecords = getNestedErrorRecords(error);
	const nestedMessage =
		extractStringProperty(nestedRecords, 'message') ??
		extractStringProperty(nestedRecords, 'error') ??
		extractStringProperty(nestedRecords, 'description');

	if (nestedMessage) {
		return nestedMessage;
	}

	return 'Unknown MAX API error';
};

export const extractMaxStatusCode = (error: unknown): number | undefined => {
	const nestedRecords = getNestedErrorRecords(error);
	return (
		extractNumericProperty(nestedRecords, 'statusCode') ??
		extractNumericProperty(nestedRecords, 'status')
	);
};

export const getMaxApiErrorDetails = (error: unknown): MaxApiErrorDetails => {
	const code = extractMaxErrorCode(error);
	const statusCode = extractMaxStatusCode(error);

	return {
		message: extractMaxErrorMessage(error),
		code,
		statusCode,
		httpCode: typeof statusCode === 'number' ? `${statusCode}` : undefined,
	};
};

export const isMaxAttachmentNotReadyError = (error: unknown): boolean => {
	const code = extractMaxErrorCode(error);
	if (code === 'attachment.not.ready') {
		return true;
	}

	return extractMaxErrorMessage(error).includes('attachment.not.ready');
};

export const toMaxApiErrorResponse = (error: unknown): JsonObject => {
	const details = getMaxApiErrorDetails(error);
	const payload: IDataObject = {
		message: details.message,
	};

	if (details.code) {
		payload.code = details.code;
	}

	if (details.statusCode) {
		payload.statusCode = details.statusCode;
	}

	return payload as JsonObject;
};

export const toMaxNodeApiError = (node: INode, error: unknown): NodeApiError => {
	const details = getMaxApiErrorDetails(error);
	return new NodeApiError(node, toMaxApiErrorResponse(error), {
		message: details.message,
		httpCode: details.httpCode,
	});
};
