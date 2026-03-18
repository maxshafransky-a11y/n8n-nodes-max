import type { IDataObject } from 'n8n-workflow';

import {
	DEFAULT_ATTACHMENT_RETRY_BASE_DELAY_MS,
	DEFAULT_ATTACHMENT_RETRY_COUNT,
} from '../uploads/maxUpload';

export type MaxRecipientType = 'chat' | 'user';

export interface MaxMessageBodyOptions {
	text?: string;
	format?: 'markdown' | 'html';
	attachments?: unknown;
	link?: unknown;
	notify?: boolean;
	requireContent?: boolean;
}

export interface MaxAnswerCallbackBodyOptions {
	notification?: string;
	messageBody?: IDataObject;
}

export interface MaxAttachmentRetryOptions {
	retryCount: number;
	baseDelayMs: number;
}

const asDataObject = (value: unknown, parameterName: string): IDataObject => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`${parameterName} must be a JSON object.`);
	}

	return value as IDataObject;
};

const asOptionalDataObject = (value: unknown): IDataObject | undefined => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined;
	}

	return value as IDataObject;
};

const asDataObjectArray = (value: unknown, parameterName: string): IDataObject[] => {
	if (!Array.isArray(value)) {
		throw new Error(`${parameterName} must be a JSON array.`);
	}

	return value.map((entry) => asDataObject(entry, parameterName));
};

const normalizeNonNegativeInteger = (value: unknown, defaultValue: number): number => {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return defaultValue;
	}

	return Math.max(0, Math.floor(value));
};

const normalizePositiveInteger = (value: unknown, defaultValue: number): number => {
	const normalizedValue = normalizeNonNegativeInteger(value, defaultValue);
	return Math.max(1, normalizedValue);
};

export const parseMaxJsonParameter = (value: unknown, parameterName: string): unknown => {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}

	if (typeof value !== 'string') {
		return value;
	}

	const trimmedValue = value.trim();
	if (trimmedValue.length === 0) {
		return undefined;
	}

	try {
		return JSON.parse(trimmedValue);
	} catch {
		throw new Error(`Invalid JSON in ${parameterName}.`);
	}
};

export const buildMaxSendMessageQuery = (
	recipientType: MaxRecipientType,
	recipientId: string,
	disableLinkPreview = false,
): IDataObject => {
	const query: IDataObject = {
		[recipientType === 'chat' ? 'chat_id' : 'user_id']: recipientId,
	};

	if (disableLinkPreview) {
		query.disable_link_preview = true;
	}

	return query;
};

export const buildMaxMessageBody = ({
	text,
	format,
	attachments,
	link,
	notify,
	requireContent = false,
}: MaxMessageBodyOptions): IDataObject => {
	const body: IDataObject = {};
	const normalizedText = typeof text === 'string' ? text : '';

	if (normalizedText.length > 0) {
		body.text = normalizedText;
	}

	const parsedAttachments = parseMaxJsonParameter(attachments, 'Attachments');
	if (parsedAttachments !== undefined) {
		body.attachments = asDataObjectArray(parsedAttachments, 'Attachments');
	}

	const parsedLink = parseMaxJsonParameter(link, 'Link');
	if (parsedLink !== undefined) {
		body.link = asDataObject(parsedLink, 'Link');
	}

	if (typeof notify === 'boolean') {
		body.notify = notify;
	}

	if (format && normalizedText.length > 0) {
		body.format = format;
	}

	if (requireContent && !('text' in body) && !('attachments' in body) && !('link' in body)) {
		throw new Error('Message content requires text, attachments, or link data.');
	}

	return body;
};

export const buildMaxAnswerCallbackBody = ({
	notification,
	messageBody,
}: MaxAnswerCallbackBodyOptions): IDataObject => {
	const body: IDataObject = {};
	const normalizedNotification = typeof notification === 'string' ? notification.trim() : '';

	if (normalizedNotification.length > 0) {
		body.notification = normalizedNotification;
	}

	if (messageBody && Object.keys(messageBody).length > 0) {
		body.message = messageBody;
	}

	if (Object.keys(body).length === 0) {
		throw new Error('Callback answer requires a notification or a message update.');
	}

	return body;
};

export const hasMaxMessageAttachments = (body?: IDataObject): boolean => {
	const attachments = body?.attachments;
	return Array.isArray(attachments) && attachments.length > 0;
};

export const getMaxAttachmentRetryOptions = (
	additionalFields?: IDataObject,
): MaxAttachmentRetryOptions => ({
	retryCount: normalizeNonNegativeInteger(
		additionalFields?.attachmentRetryCount,
		DEFAULT_ATTACHMENT_RETRY_COUNT,
	),
	baseDelayMs: normalizePositiveInteger(
		additionalFields?.attachmentRetryBaseDelayMs,
		DEFAULT_ATTACHMENT_RETRY_BASE_DELAY_MS,
	),
});

export const normalizeMaxNodeResponse = (response: unknown): IDataObject => {
	if (response && typeof response === 'object' && !Array.isArray(response)) {
		return response as IDataObject;
	}

	if (Array.isArray(response)) {
		return { items: response as unknown as never[] } as IDataObject;
	}

	return { value: response as never } as IDataObject;
};

export const normalizeMaxMessageOperationResponse = (response: unknown): IDataObject => {
	const normalizedResponse = { ...normalizeMaxNodeResponse(response) };
	const responseRecord = asOptionalDataObject(response);
	const messageRecord = asOptionalDataObject(responseRecord?.message) ?? responseRecord;
	const bodyRecord = asOptionalDataObject(messageRecord?.body);
	const recipientRecord = asOptionalDataObject(messageRecord?.recipient);
	const senderRecord = asOptionalDataObject(messageRecord?.sender);

	const messageId = bodyRecord?.mid;
	if (typeof messageId === 'string' && messageId.length > 0) {
		normalizedResponse.messageId = messageId;
	}

	const sequence = bodyRecord?.seq;
	if (typeof sequence === 'number' && Number.isFinite(sequence)) {
		normalizedResponse.sequence = sequence;
	}

	const text = bodyRecord?.text;
	if (typeof text === 'string') {
		normalizedResponse.text = text;
	}

	const chatId = recipientRecord?.chat_id;
	if (typeof chatId === 'number' || typeof chatId === 'string') {
		normalizedResponse.chatId = chatId;
	}

	const userId = recipientRecord?.user_id;
	if (typeof userId === 'number' || typeof userId === 'string') {
		normalizedResponse.userId = userId;
	}

	const chatType = recipientRecord?.chat_type;
	if (typeof chatType === 'string' && chatType.length > 0) {
		normalizedResponse.chatType = chatType;
	}

	const senderId = senderRecord?.user_id;
	if (typeof senderId === 'number' || typeof senderId === 'string') {
		normalizedResponse.senderId = senderId;
	}

	return normalizedResponse;
};
