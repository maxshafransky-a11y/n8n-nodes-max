import type { INodeProperties } from 'n8n-workflow';

export const rawApiDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['rawApi'],
			},
		},
		options: [{ name: 'Call Endpoint', value: 'call', action: 'Call a raw API endpoint' }],
		default: 'call',
	},
	{
		displayName: 'HTTP Method',
		name: 'httpMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['rawApi'],
			},
		},
		options: [
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'GET', value: 'GET' },
			{ name: 'PATCH', value: 'PATCH' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
		],
		default: 'GET',
	},
	{
		displayName: 'Path',
		name: 'path',
		type: 'string',
		default: '',
		placeholder: '/messages',
		displayOptions: {
			show: {
				resource: ['rawApi'],
			},
		},
		description: 'MAX API path relative to the configured base URL',
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['rawApi'],
			},
		},
		description: 'Query parameters as JSON',
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['rawApi'],
				httpMethod: ['POST', 'PUT', 'PATCH', 'DELETE'],
			},
		},
		description: 'JSON request body',
	},
	{
		displayName: 'Return Full Response',
		name: 'returnFullResponse',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['rawApi'],
			},
		},
		description: 'Whether to return headers and status code in addition to the body',
	},
];
