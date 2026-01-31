import * as fs from 'fs/promises';
import * as path from 'path';
import { AiGuardConfig, AnalysisResult, FileAnalysis } from './types';
import { ALL_RULES } from './rules';
import { resolveFiles } from './utils/files';

export async function analyzeProject(
  cwd: string,
  config: AiGuardConfig,
  stagedFiles?: string[],
): Promise<AnalysisResult> {
  const files = stagedFiles ?? await resolveFiles(cwd, config);
  const results: FileAnalysis[] = [];

  for (const file of files) {
    const absolutePath = path.isAbsolute(file) ? file : path.join(cwd, file);

    try {
      await fs.access(absolutePath);
    } catch {
      continue;
    }

    const violations = ALL_RULES.flatMap((rule) => {
      try {
        return rule.analyze(absolutePath, config);
      } catch {
        return [];
      }
    });

    if (violations.length > 0) {
      results.push({
        filePath: path.relative(cwd, absolutePath),
        violations,
      });
    }
  }

  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);

  return {
    files: results,
    totalViolations,
    passed: totalViolations === 0,
  };
}
