import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distRoot = path.join(root, 'dist');
const ignoreDirectories = new Set(['dist', 'node_modules', '.git']);
const copyableExtensions = new Set(['.svg', '.png', '.json']);

const walk = async (currentDirectory) => {
  const entries = await readdir(currentDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDirectory, entry.name);
    const relativePath = path.relative(root, absolutePath);

    if (entry.isDirectory()) {
      if (ignoreDirectories.has(entry.name) || relativePath.includes('__pycache__')) {
        continue;
      }

      await walk(absolutePath);
      continue;
    }

    const extension = path.extname(entry.name);
    const insideSchemaDirectory = relativePath.includes(`${path.sep}__schema__${path.sep}`);

    if (!copyableExtensions.has(extension) && !insideSchemaDirectory) {
      continue;
    }

    const targetPath = path.join(distRoot, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(absolutePath, targetPath, { force: true });
  }
};

const distExists = await stat(distRoot).then(() => true).catch(() => false);
if (!distExists) {
  throw new Error('dist directory does not exist. Run tsc before copying static assets.');
}

await walk(root);
