import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

import { DEFAULT_MAX_BASE_URL } from '../nodes/Max/transport/maxApiRequest';

export class MaxApi implements ICredentialType {
	name = 'maxApi';

	displayName = 'MAX API';

	icon: Icon = {
		light: 'file:../icons/max.svg',
		dark: 'file:../icons/max.dark.svg',
	};

	documentationUrl = 'https://dev.max.ru/docs-api';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Bot token from the MAX bot panel. MAX supports only the Authorization header for token-based access.',
		},
		{
			displayName: 'Use Custom Base URL',
			name: 'useCustomBaseUrl',
			type: 'boolean',
			default: false,
			description: 'Enable only for advanced or non-production environments',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: DEFAULT_MAX_BASE_URL,
			placeholder: DEFAULT_MAX_BASE_URL,
			displayOptions: {
				show: {
					useCustomBaseUrl: [true],
				},
			},
			description: 'Advanced override for the MAX API base URL',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: `={{$credentials.useCustomBaseUrl ? $credentials.baseUrl : "${DEFAULT_MAX_BASE_URL}"}}`,
			url: '/me',
			method: 'GET',
		},
	};
}
