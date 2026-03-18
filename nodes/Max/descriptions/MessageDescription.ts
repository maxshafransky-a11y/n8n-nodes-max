import type { INodeProperties } from 'n8n-workflow';

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{ name: 'Answer Callback', value: 'answerCallback', action: 'Answer a message callback' },
			{ name: 'Delete', value: 'delete', action: 'Delete a message' },
			{ name: 'Edit', value: 'edit', action: 'Edit a message' },
			{ name: 'Get', value: 'get', action: 'Get a message' },
			{ name: 'Send', value: 'send', action: 'Send a message' },
		],
		default: 'send',
	},
	{
		displayName: 'Recipient Type',
		name: 'recipientType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
			},
		},
		options: [
			{ name: 'Chat', value: 'chat' },
			{ name: 'User', value: 'user' },
		],
		default: 'chat',
		description: 'Where the message should be sent',
	},
	{
		displayName: 'Chat ID',
		name: 'chatId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
				recipientType: ['chat'],
			},
		},
		description: 'Target chat identifier',
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
				recipientType: ['user'],
			},
		},
		description: 'Target user identifier',
	},
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['get', 'edit', 'delete'],
			},
		},
		description: 'Message identifier',
	},
	{
		displayName: 'Callback ID',
		name: 'callbackId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['answerCallback'],
			},
		},
		description: 'Callback identifier returned by MAX',
	},
	{
		displayName: 'Notification',
		name: 'notification',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['answerCallback'],
			},
		},
		description: 'One-time notification text shown to the user for the callback answer',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send', 'edit', 'answerCallback'],
			},
		},
		description: 'Message text',
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send', 'edit', 'answerCallback'],
			},
		},
		options: [
			{ name: 'HTML', value: 'html' },
			{ name: 'Markdown', value: 'markdown' },
		],
		default: 'markdown',
		description: 'Text formatting mode',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add field',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send', 'edit', 'answerCallback'],
			},
		},
		options: [
			{
				displayName: 'Attachment Retry Base Delay',
				name: 'attachmentRetryBaseDelayMs',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 250,
				description:
					'Base delay in milliseconds for exponential backoff when MAX returns attachment.not.ready for attached media',
			},
			{
				displayName: 'Attachment Retry Count',
				name: 'attachmentRetryCount',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 5,
				description:
					'How many times to retry after attachment.not.ready when sending attached media',
			},
			{
				displayName: 'Attachments (JSON)',
				name: 'attachmentsJson',
				type: 'json',
				default: '[]',
				description: 'Attachments array ready for MAX NewMessageBody',
			},
			{
				displayName: 'Disable Link Preview',
				name: 'disableLinkPreview',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						'/operation': ['send'],
					},
				},
				description: 'Whether to disable link previews for send operations',
			},
			{
				displayName: 'Link (JSON)',
				name: 'linkJson',
				type: 'json',
				default: '{}',
				description: 'Link object ready for MAX NewMessageBody',
			},
			{
				displayName: 'Notify',
				name: 'notify',
				type: 'boolean',
				default: true,
				description: 'Whether MAX should notify recipients about the message',
			},
		],
	},
];
