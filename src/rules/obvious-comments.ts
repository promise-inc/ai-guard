import { AiGuardConfig, Violation } from '../types';
import * as fs from 'fs';

export const name = 'obvious-comments';
export const description = 'Detects AI-style obvious or redundant comments';

const OBVIOUS_PATTERNS = [
  /\/\/\s*import/i,
  /\/\/\s*export/i,
  /\/\/\s*define\s/i,
  /\/\/\s*declare\s/i,
  /\/\/\s*set\s+(the\s+)?(\w+)\s+to\s/i,
  /\/\/\s*return\s+(the\s+)?\w+/i,
  /\/\/\s*create\s+(a\s+)?(new\s+)?\w+/i,
  /\/\/\s*initialize\s/i,
  /\/\/\s*check\s+if\s/i,
  /\/\/\s*loop\s+(through|over)\s/i,
  /\/\/\s*iterate\s+(through|over)\s/i,
  /\/\/\s*increment\s/i,
  /\/\/\s*decrement\s/i,
  /\/\/\s*assign\s/i,
  /\/\/\s*call\s+(the\s+)?\w+/i,
  /\/\/\s*get\s+(the\s+)?\w+\s+from\s/i,
  /\/\/\s*add\s+(the\s+)?\w+\s+to\s/i,
  /\/\/\s*remove\s+(the\s+)?\w+\s+from\s/i,
  /\/\/\s*update\s+(the\s+)?\w+/i,
  /\/\/\s*delete\s+(the\s+)?\w+/i,
  /\/\/\s*log\s+(the\s+)?\w+/i,
  /\/\/\s*print\s+(the\s+)?\w+/i,
  /\/\/\s*constructor/i,
  /\/\/\s*destructor/i,
  /\/\/\s*getter/i,
  /\/\/\s*setter/i,
];

export function analyze(filePath: string, config: AiGuardConfig): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed.startsWith('//')) continue;

    for (const pattern of OBVIOUS_PATTERNS) {
      if (pattern.test(trimmed)) {
        violations.push({
          rule: name,
          file: filePath,
          message: `Obvious/redundant comment: "${trimmed}"`,
          line: i + 1,
          severity: 'warning',
        });
        break;
      }
    }
  }

  // Check for AI text patterns in comments
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) continue;

    const commentText = trimmed.replace(/^\/\/\s*/, '').replace(/^\*\s*/, '');

    for (const pattern of config.aiPatterns.forbid) {
      if (commentText.toLowerCase().includes(pattern.toLowerCase())) {
        violations.push({
          rule: name,
          file: filePath,
          message: `AI-pattern in comment: "${pattern}" at line ${i + 1}`,
          line: i + 1,
          severity: 'error',
        });
        break;
      }
    }
  }

  return violations;
}
