const assert = require('node:assert/strict');

const helpers = require('../../dist/nodes/MaxTrigger/triggerHelpers.js');

assert.deepEqual(
	helpers.buildMaxSubscriptionBody('https://example.test/webhook', 'secret-123', ['message_created']),
	{
		url: 'https://example.test/webhook',
		secret: 'secret-123',
		update_types: ['message_created'],
	},
	'subscription bodies should include URL, secret, and update types',
);
assert.deepEqual(
	helpers.extractMaxSubscriptions({
		subscriptions: [{ url: 'https://example.test/webhook', update_types: ['message_created'] }],
	}),
	[{ url: 'https://example.test/webhook', update_types: ['message_created'] }],
	'subscription extraction should read the subscriptions array from MAX responses',
);
assert.deepEqual(
	helpers.findMaxSubscriptionByUrl(
		{ subscriptions: [{ url: 'https://example.test/webhook' }, { url: 'https://other.test' }] },
		'https://example.test/webhook',
	),
	{ url: 'https://example.test/webhook' },
	'subscription lookup should match by webhook URL',
);
assert.equal(
	helpers.hasValidMaxWebhookSecret('secret-123', { 'x-max-bot-api-secret': 'secret-123' }),
	true,
	'webhook secret validation should accept the configured secret',
);
assert.equal(
	helpers.hasValidMaxWebhookSecret('secret-123', { 'x-max-bot-api-secret': 'wrong-secret' }),
	false,
	'webhook secret validation should reject mismatched secrets',
);
assert.deepEqual(
	helpers.normalizeMaxTriggerEvent({ update_type: 'message_created', message: { body: { text: 'hello' } } }),
	{ update_type: 'message_created', updateType: 'message_created', message: { body: { text: 'hello' } } },
	'trigger event normalization should preserve the payload and add an updateType alias',
);

console.log('integration trigger checks passed');
