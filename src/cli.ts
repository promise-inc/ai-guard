#!/usr/bin/env node

import { loadConfig } from './config';
import { analyzeProject } from './engine';
import { getStagedFiles } from './utils/files';
import { formatResult } from './utils/output';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const staged = args.includes('--staged');
  const cwd = process.cwd();

  const config = await loadConfig(cwd);

  let stagedFiles: string[] | undefined;
  if (staged) {
    stagedFiles = await getStagedFiles();
    if (stagedFiles.length === 0) {
      console.log('\nai-guard: No staged files to analyze.\n');
      process.exit(0);
    }
  }

  const analysis = await analyzeProject(cwd, config, stagedFiles);

  console.log(formatResult(analysis));

  process.exit(analysis.passed ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error('ai-guard error:', err);
  process.exit(2);
});
