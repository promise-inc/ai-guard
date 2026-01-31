import * as fs from 'fs/promises';
import * as path from 'path';
import { AiGuardConfig } from '../types';

function matchesGlob(filePath: string, pattern: string): boolean {
  const regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\{\{GLOBSTAR\}\}/g, '.*');
  return new RegExp(`^${regexStr}$`).test(filePath);
}

function matchesAnyGlob(filePath: string, patterns: string[]): boolean {
  return patterns.some((p) => matchesGlob(filePath, p));
}

async function walkDir(dir: string, baseDir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      files.push(...await walkDir(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

export async function resolveFiles(cwd: string, config: AiGuardConfig): Promise<string[]> {
  const allFiles = await walkDir(cwd, cwd);

  return allFiles.filter((file) => {
    const included = matchesAnyGlob(file, config.include);
    const excluded = matchesAnyGlob(file, config.exclude);
    return included && !excluded;
  });
}

export async function getStagedFiles(): Promise<string[]> {
  const { execSync } = await import('child_process');
  const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf-8',
  });
  return staged
    .trim()
    .split('\n')
    .filter((f) => f.length > 0 && /\.(ts|tsx|js|jsx)$/.test(f));
}
