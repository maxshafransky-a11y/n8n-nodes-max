import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const ciWorkflowPath = path.join(process.cwd(), '.github', 'workflows', 'ci.yml');
const releaseWorkflowPath = path.join(process.cwd(), '.github', 'workflows', 'release.yml');
const readmePath = path.join(process.cwd(), 'README.md');
const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
const licensePath = path.join(process.cwd(), 'LICENSE');
const licenseMarkdownPath = path.join(process.cwd(), 'LICENSE.md');

const errors = [];
const warnings = [];
const distFiles = [
	...((Array.isArray(packageJson.n8n?.credentials) ? packageJson.n8n.credentials : []).map((file) =>
		path.join(process.cwd(), file),
	)),
	...((Array.isArray(packageJson.n8n?.nodes) ? packageJson.n8n.nodes : []).map((file) =>
		path.join(process.cwd(), file),
	)),
];

if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
	errors.push('Runtime dependencies must remain empty for the verified-ready package strategy.');
}

if (!Array.isArray(packageJson.keywords) || !packageJson.keywords.includes('n8n-community-node-package')) {
	errors.push('package.json keywords must include n8n-community-node-package.');
}

if (!packageJson.n8n || !Array.isArray(packageJson.n8n.credentials) || packageJson.n8n.credentials.length === 0) {
	errors.push('package.json.n8n.credentials must list the compiled credential files.');
}

if (!packageJson.n8n || !Array.isArray(packageJson.n8n.nodes) || packageJson.n8n.nodes.length === 0) {
	errors.push('package.json.n8n.nodes must list the compiled node files.');
}

if (!existsSync(licensePath) && !existsSync(licenseMarkdownPath)) {
	errors.push('A license file is required.');
}

if (typeof packageJson.repository?.url !== 'string' || packageJson.repository.url.length === 0) {
	errors.push('package.json.repository.url must be configured.');
}

if (!existsSync(readmePath)) {
	errors.push('README.md is required.');
}

if (!existsSync(changelogPath)) {
	errors.push('CHANGELOG.md is required.');
}

if (!existsSync(ciWorkflowPath)) {
	errors.push('A CI workflow is required at .github/workflows/ci.yml.');
}

if (!existsSync(releaseWorkflowPath)) {
	errors.push('A release workflow is required at .github/workflows/release.yml.');
}

for (const compiledFilePath of distFiles) {
	if (!existsSync(compiledFilePath)) {
		errors.push(`Compiled artifact is missing: ${path.relative(process.cwd(), compiledFilePath)}`);
	}
}

if (existsSync(releaseWorkflowPath)) {
	const releaseWorkflow = readFileSync(releaseWorkflowPath, 'utf8');
	if (!releaseWorkflow.includes('npm publish --provenance --access public')) {
		errors.push('Release workflow must publish with npm provenance.');
	}
}

if (packageJson.repository?.url?.includes('your-org') || packageJson.homepage?.includes('your-org')) {
	warnings.push('Repository and homepage still use placeholder values. Replace them before publishing.');
}

if (packageJson.author?.name === 'TBD' || packageJson.author?.email === 'TBD') {
	warnings.push('Author metadata still uses placeholder values. Replace them before publishing.');
}

console.log('Local package verification summary');
console.log(`- Package: ${packageJson.name}@${packageJson.version}`);
console.log(`- Runtime dependencies: ${packageJson.dependencies ? Object.keys(packageJson.dependencies).length : 0}`);
console.log(`- Dist artifacts checked: ${distFiles.length}`);

if (warnings.length > 0) {
	console.log('\nWarnings:');
	for (const warning of warnings) {
		console.log(`- ${warning}`);
	}
}

if (errors.length > 0) {
	console.error('\nErrors:');
	for (const error of errors) {
		console.error(`- ${error}`);
	}
	process.exit(1);
}

console.log('\nLocal package verification passed.');
