const assert = require('node:assert/strict');

const helpers = require('../../dist/nodes/Max/actions/messageHelpers.js');
const upload = require('../../dist/nodes/Max/uploads/maxUpload.js');

assert.deepEqual(
	helpers.buildMaxSendMessageQuery('chat', 'chat-1', true),
	{ chat_id: 'chat-1', disable_link_preview: true },
	'send queries should target chats with optional link preview suppression',
);
assert.deepEqual(
	helpers.buildMaxSendMessageQuery('user', 'user-1', false),
	{ user_id: 'user-1' },
	'send queries should target users without adding optional flags by default',
);
assert.deepEqual(
	helpers.buildMaxMessageBody({
		text: 'Hello MAX',
		format: 'markdown',
		attachments: '[{"type":"file","payload":{"token":"abc"}}]',
		link: '{"type":"contact","contact_id":"42"}',
		notify: true,
		requireContent: true,
	}),
	{
		text: 'Hello MAX',
		attachments: [{ type: 'file', payload: { token: 'abc' } }],
		link: { type: 'contact', contact_id: '42' },
		notify: true,
		format: 'markdown',
	},
	'message bodies should combine text, attachments, link, notify, and format fields',
);
assert.deepEqual(
	helpers.buildMaxAnswerCallbackBody({
		notification: 'Done',
		messageBody: { text: 'Updated' },
	}),
	{ notification: 'Done', message: { text: 'Updated' } },
	'callback bodies should support both notifications and message updates',
);
assert.throws(
	() => helpers.buildMaxMessageBody({ requireContent: true }),
	/message content requires text, attachments, or link data/i,
	'message helpers should reject empty required content',
);
assert.throws(
	() => helpers.parseMaxJsonParameter('{broken', 'Attachments'),
	/invalid json/i,
	'JSON helper should reject malformed JSON input',
);
assert.deepEqual(
	helpers.normalizeMaxNodeResponse(['a', 'b']),
	{ items: ['a', 'b'] },
	'node response normalization should wrap arrays into a stable object shape',
);
assert.equal(
	helpers.hasMaxMessageAttachments({ attachments: [{ type: 'file', payload: { token: 'abc' } }] }),
	true,
	'attachment detection should report true when the body contains attachments',
);
assert.equal(
	helpers.hasMaxMessageAttachments({ text: 'No files yet' }),
	false,
	'attachment detection should report false when the body contains no attachments',
);
assert.deepEqual(
	helpers.getMaxAttachmentRetryOptions({ attachmentRetryCount: 3, attachmentRetryBaseDelayMs: 125 }),
	{ retryCount: 3, baseDelayMs: 125 },
	'attachment retry options should preserve explicit values',
);
assert.deepEqual(
	helpers.getMaxAttachmentRetryOptions({ attachmentRetryCount: -2, attachmentRetryBaseDelayMs: 0 }),
	{ retryCount: 0, baseDelayMs: 1 },
	'attachment retry options should normalize invalid numeric values',
);
assert.deepEqual(
	helpers.normalizeMaxMessageOperationResponse({
		message: {
			recipient: { chat_id: '-1', chat_type: 'chat' },
			body: { mid: 'mid-1', seq: 10, text: 'hello' },
			sender: { user_id: 42 },
		},
	}),
	{
		message: {
			recipient: { chat_id: '-1', chat_type: 'chat' },
			body: { mid: 'mid-1', seq: 10, text: 'hello' },
			sender: { user_id: 42 },
		},
		messageId: 'mid-1',
		sequence: 10,
		text: 'hello',
		chatId: '-1',
		chatType: 'chat',
		senderId: 42,
	},
	'message response normalization should expose top-level aliases for MAX message metadata',
);
assert.deepEqual(
	helpers.normalizeMaxMessageOperationResponse({
		recipient: { user_id: 'user-1' },
		body: { mid: 'mid-2', text: 'direct' },
	}),
	{
		recipient: { user_id: 'user-1' },
		body: { mid: 'mid-2', text: 'direct' },
		messageId: 'mid-2',
		text: 'direct',
		userId: 'user-1',
	},
	'message response normalization should also work for direct GET responses',
);

const uploadRequestOptions = upload.buildMaxUploadBinaryRequestOptions(
	{ accessToken: 'token-1' },
	'https://upload.max.example',
	upload.buildMaxUploadFormData({
		data: Buffer.from('payload'),
		fileName: 'payload.txt',
		mimeType: 'text/plain',
	}),
);
assert.equal(uploadRequestOptions.method, 'POST', 'upload requests should use POST');
assert.equal(uploadRequestOptions.url, 'https://upload.max.example', 'upload requests should keep the upload URL');
assert.equal(uploadRequestOptions.headers.Authorization, 'token-1', 'upload requests should send the MAX access token in the Authorization header');

console.log('message helper checks passed');
