import type { INodeProperties } from 'n8n-workflow';

export const uploadDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['upload'],
			},
		},
		options: [
			{ name: 'Get Upload URL', value: 'getUploadUrl', action: 'Get an upload URL' },
			{ name: 'Upload and Return Attachment', value: 'uploadAndReturnAttachment', action: 'Upload and return an attachment' },
			{ name: 'Upload Binary', value: 'uploadBinary', action: 'Upload binary data' },
		],
		default: 'getUploadUrl',
	},
	{
		displayName: 'Attachment Type',
		name: 'attachmentType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['upload'],
			},
		},
		options: [
			{ name: 'Audio', value: 'audio' },
			{ name: 'File', value: 'file' },
			{ name: 'Image', value: 'image' },
			{ name: 'Video', value: 'video' },
		],
		default: 'file',
		description: 'Upload type expected by MAX',
	},
	{
		displayName: 'Upload URL',
		name: 'uploadUrl',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['upload'],
				operation: ['uploadBinary'],
			},
		},
		description: 'Pre-signed MAX upload URL returned by the Get Upload URL operation',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['upload'],
				operation: ['uploadBinary', 'uploadAndReturnAttachment'],
			},
		},
		description: 'Binary property that contains the file to upload',
	},
];
