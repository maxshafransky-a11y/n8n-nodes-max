import type { IDataObject, IHttpRequestOptions } from 'n8n-workflow';

export type MaxUploadType = 'image' | 'video' | 'audio' | 'file';

export interface MaxUploadPayload {
	type: MaxUploadType;
	binaryProperty: string;
}

export interface MaxBinaryUploadInput {
	data: Buffer;
	fileName?: string;
	mimeType?: string;
}

export interface MaxUploadLinkResponse extends IDataObject {
	url: string;
	token?: string;
}

export interface MaxUploadResult extends IDataObject {
	token?: string;
	retval?: string;
}

export interface MaxMessageAttachment {
	type: MaxUploadType;
	payload: IDataObject;
}

export interface MaxUploadRequestContext {
	helpers: {
		httpRequest: (requestOptions: IHttpRequestOptions) => Promise<unknown>;
	};
}

export interface MaxUploadRequestCredentials {
	accessToken?: string;
}

export const DEFAULT_ATTACHMENT_RETRY_COUNT = 5;
export const DEFAULT_ATTACHMENT_RETRY_BASE_DELAY_MS = 250;

export const buildMaxUploadRequestQuery = (type: MaxUploadType): IDataObject => ({ type });

export const buildMaxUploadRetryDelays = (
	retryCount = DEFAULT_ATTACHMENT_RETRY_COUNT,
	baseDelayMs = DEFAULT_ATTACHMENT_RETRY_BASE_DELAY_MS,
): number[] => {
	const safeRetryCount = Math.max(0, Math.floor(retryCount));
	const safeBaseDelayMs = Math.max(1, Math.floor(baseDelayMs));
	const delays: number[] = [];

	for (let index = 0; index < safeRetryCount; index++) {
		delays.push(safeBaseDelayMs * 2 ** index);
	}

	return delays;
};

export const createMaxUploadPayload = (payload: MaxUploadPayload): MaxUploadPayload => ({
	type: payload.type,
	binaryProperty: payload.binaryProperty,
});

export const buildMaxUploadFormData = (input: MaxBinaryUploadInput): FormData => {
	const formData = new FormData();
	const blob = new Blob([input.data], {
		type: input.mimeType ?? 'application/octet-stream',
	});

	formData.append('data', blob, input.fileName ?? 'file');
	return formData;
};

export const buildMaxUploadBinaryRequestOptions = (
	credentials: MaxUploadRequestCredentials,
	uploadUrl: string,
	formData: FormData,
): IHttpRequestOptions => {
	if (!credentials.accessToken) {
		throw new Error('MAX credentials are missing an access token for upload requests.');
	}

	return {
		url: uploadUrl,
		method: 'POST',
		body: formData,
		json: false,
		headers: {
			Authorization: credentials.accessToken,
		},
	};
};

export const maxUploadBinaryRequest = async (
	context: MaxUploadRequestContext,
	credentials: MaxUploadRequestCredentials,
	uploadUrl: string,
	formData: FormData,
): Promise<unknown> => {
	return await context.helpers.httpRequest(
		buildMaxUploadBinaryRequestOptions(credentials, uploadUrl, formData),
	);
};

export const extractMaxUploadAttachmentToken = (
	type: MaxUploadType,
	uploadLinkResponse?: Partial<MaxUploadLinkResponse>,
	uploadResult?: Partial<MaxUploadResult>,
): string | undefined => {
	if (type === 'video' || type === 'audio') {
		return uploadLinkResponse?.token ?? uploadResult?.token;
	}

	return uploadResult?.token ?? uploadLinkResponse?.token;
};

export const buildMaxMessageAttachment = (
	type: MaxUploadType,
	uploadLinkResponse?: Partial<MaxUploadLinkResponse>,
	uploadResult?: Partial<MaxUploadResult>,
): MaxMessageAttachment => {
	const attachmentToken = extractMaxUploadAttachmentToken(type, uploadLinkResponse, uploadResult);

	if (attachmentToken) {
		return {
			type,
			payload: {
				token: attachmentToken,
			},
		};
	}

	if (uploadResult && Object.keys(uploadResult).length > 0) {
		return {
			type,
			payload: { ...uploadResult },
		};
	}

	throw new Error('MAX upload response does not contain attachment payload data.');
};
