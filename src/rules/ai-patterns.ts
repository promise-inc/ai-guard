import * as fs from 'fs';
import { AiGuardConfig, Violation } from '../types';

export const name = 'ai-patterns';
export const description = 'Detects textual patterns commonly found in AI-generated code';

const CODE_AI_PATTERNS = [
  /\/\/\s*Step\s+\d+/i,
  /\/\/\s*-{3,}/,
  /\/\/\s*={3,}/,
  /\/\/\s*#{3,}/,
  /\/\*\*[\s\S]*?@description\s+This\s+(function|method|class)/i,
  /\/\/\s*Helper\s+(function|method)\s+/i,
  /\/\/\s*Utility\s+(function|method)\s+/i,
  /\/\/\s*Main\s+(function|logic)\s+/i,
];

function findCodePatterns(lines: string[], filePath: string): Violation[] {
  const violations: Violation[] = [];
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of CODE_AI_PATTERNS) {
      if (pattern.test(lines[i])) {
        violations.push({
          rule: name,
          file: filePath,
          message: `AI-generated pattern detected: "${lines[i].trim()}"`,
          line: i + 1,
          severity: 'warning',
        });
        break;
      }
    }
  }
  return violations;
}

function findVerboseJsDoc(content: string, filePath: string): Violation[] {
  const blocks = content.match(/\/\*\*[\s\S]*?\*\//g) ?? [];
  return blocks
    .filter((block) => {
      const lineCount = block.split('\n').length;
      const hasOnlyBasicTags = /\*\s*@(param|returns|description)\s/.test(block) &&
        !/@(throws|example|deprecated|see|link)/.test(block);
      return lineCount > 8 && hasOnlyBasicTags;
    })
    .map((block) => ({
      rule: name,
      file: filePath,
      message: `Overly verbose JSDoc (${block.split('\n').length} lines)`,
      line: content.substring(0, content.indexOf(block)).split('\n').length,
      severity: 'warning' as const,
    }));
}

export function analyze(filePath: string, config: AiGuardConfig): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  return [
    ...findCodePatterns(lines, filePath),
    ...findVerboseJsDoc(content, filePath),
  ];
}
