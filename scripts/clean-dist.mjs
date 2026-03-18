import { rm } from 'node:fs/promises';

await rm(new URL('../dist', import.meta.url), {
	recursive: true,
	force: true,
	maxRetries: 5,
	retryDelay: 100,
});
await rm(new URL('../tsconfig.tsbuildinfo', import.meta.url), { force: true });
