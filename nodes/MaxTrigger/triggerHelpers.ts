import type { IDataObject } from 'n8n-workflow';

export interface MaxSubscriptionRecord extends IDataObject {
	url?: string;
	update_types?: string[];
	id?: string;
	subscription_id?: string;
}

export interface MaxWebhookHeaderContainer {
	[key: string]: string | string[] | undefined;
}

const asRecord = (value: unknown): IDataObject | undefined => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined;
	}

	return value as IDataObject;
};

export const normalizeMaxWebhookSecret = (secret: string): string | undefined => {
	const trimmedSecret = secret.trim();
	return trimmedSecret.length > 0 ? trimmedSecret : undefined;
};

export const buildMaxSubscriptionBody = (
	url: string,
	webhookSecret: string,
	updateTypes: string[],
): IDataObject => {
	const body: IDataObject = {
		url,
	};
	const normalizedSecret = normalizeMaxWebhookSecret(webhookSecret);

	if (normalizedSecret) {
		body.secret = normalizedSecret;
	}

	if (updateTypes.length > 0) {
		body.update_types = [...updateTypes];
	}

	return body;
};

export const extractMaxSubscriptions = (response: unknown): MaxSubscriptionRecord[] => {
	const responseRecord = asRecord(response);
	if (!responseRecord) {
		return [];
	}

	const rawSubscriptions = responseRecord.subscriptions;
	if (!Array.isArray(rawSubscriptions)) {
		return [];
	}

	return rawSubscriptions.filter((entry): entry is MaxSubscriptionRecord => {
		return !!entry && typeof entry === 'object' && !Array.isArray(entry);
	});
};

export const findMaxSubscriptionByUrl = (
	response: unknown,
	webhookUrl: string,
): MaxSubscriptionRecord | undefined => {
	return extractMaxSubscriptions(response).find((subscription) => subscription.url === webhookUrl);
};

export const getMaxWebhookSecretHeader = (
	headers: MaxWebhookHeaderContainer | IDataObject,
): string | undefined => {
	const lowerCaseValue = headers['x-max-bot-api-secret'];
	if (typeof lowerCaseValue === 'string' && lowerCaseValue.length > 0) {
		return lowerCaseValue;
	}

	if (Array.isArray(lowerCaseValue) && lowerCaseValue.length > 0) {
		return lowerCaseValue[0];
	}

	const canonicalValue = headers['X-Max-Bot-Api-Secret'];
	if (typeof canonicalValue === 'string' && canonicalValue.length > 0) {
		return canonicalValue;
	}

	if (Array.isArray(canonicalValue) && canonicalValue.length > 0) {
		return canonicalValue[0];
	}

	return undefined;
};

export const hasValidMaxWebhookSecret = (
	expectedSecret: string,
	headers: MaxWebhookHeaderContainer | IDataObject,
): boolean => {
	const normalizedSecret = normalizeMaxWebhookSecret(expectedSecret);
	if (!normalizedSecret) {
		return true;
	}

	return getMaxWebhookSecretHeader(headers) === normalizedSecret;
};

export const normalizeMaxTriggerEvent = (payload: IDataObject): IDataObject => {
	const normalizedPayload: IDataObject = {
		...payload,
	};

	const updateType = payload.update_type;
	if (typeof updateType === 'string' && updateType.length > 0) {
		normalizedPayload.updateType = updateType;
	}

	return normalizedPayload;
};
