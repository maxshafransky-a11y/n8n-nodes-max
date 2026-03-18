const assert = require('node:assert/strict');

const { executeWithAttachmentRetry } = require('../../dist/nodes/Max/actions/message.js');

const createAttachmentNotReadyError = () => ({
	code: 'attachment.not.ready',
	message: 'attachment.not.ready',
	statusCode: 409,
});

const run = async () => {
	const waits = [];
	let attempts = 0;
	const successResult = await executeWithAttachmentRetry(
		async () => {
			attempts += 1;
			if (attempts < 3) {
				throw createAttachmentNotReadyError();
			}

			return { ok: true, attempts };
		},
		{
			enabled: true,
			retryCount: 3,
			baseDelayMs: 100,
		},
		async (delayMs) => {
			waits.push(delayMs);
		},
	);
	assert.deepEqual(successResult, { ok: true, attempts: 3 }, 'retry helper should eventually return the successful response');
	assert.deepEqual(waits, [100, 200], 'retry helper should use exponential backoff between attachment retries');

	let nonRetriableAttempts = 0;
	await assert.rejects(
		executeWithAttachmentRetry(
			async () => {
				nonRetriableAttempts += 1;
				throw new Error('rate limited');
			},
			{
				enabled: true,
				retryCount: 4,
				baseDelayMs: 50,
			},
			async () => {
				throw new Error('wait should not run for non-retriable errors');
			},
		),
		/rate limited/i,
		'retry helper should stop immediately for non-retriable errors',
	);
	assert.equal(nonRetriableAttempts, 1, 'non-retriable errors should not trigger extra attempts');

	let disabledAttempts = 0;
	await assert.rejects(
		executeWithAttachmentRetry(
			async () => {
				disabledAttempts += 1;
				throw createAttachmentNotReadyError();
			},
			{
				enabled: false,
				retryCount: 4,
				baseDelayMs: 50,
			},
			async () => {
				throw new Error('wait should not run when retries are disabled');
			},
		),
		(error) => error && error.code === 'attachment.not.ready',
		'retry helper should not retry when attachment retries are disabled',
	);
	assert.equal(disabledAttempts, 1, 'disabled retry mode should keep a single attempt');

	console.log('message retry checks passed');
};

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
