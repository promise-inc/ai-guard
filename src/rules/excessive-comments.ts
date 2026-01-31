import { Project } from 'ts-morph';
import { AiGuardConfig, Violation } from '../types';

export const name = 'excessive-comments';
export const description = 'Detects files with too many comments relative to code';

export function analyze(filePath: string, config: AiGuardConfig): Violation[] {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFile = project.addSourceFileAtPath(filePath);
  const fullText = sourceFile.getFullText();
  const lines = fullText.split('\n');
  const totalLines = lines.filter((l) => l.trim().length > 0).length;

  if (totalLines === 0) return [];

  let commentLines = 0;

  // Count single-line comments
  const leadingCommentRanges = sourceFile.getDescendantsOfKind(
    // SyntaxKind values for comments aren't directly available via getDescendantsOfKind
    // We'll use regex on the full text instead
    0, // placeholder
  );
  void leadingCommentRanges;

  // Regex-based counting (more reliable for comment ratio)
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('*/')) {
      commentLines++;
    }
  }

  const ratio = commentLines / totalLines;

  if (ratio > config.maxCommentsRatio) {
    return [{
      rule: name,
      file: filePath,
      message: `Excessive comments (${Math.round(ratio * 100)}% — max ${Math.round(config.maxCommentsRatio * 100)}%)`,
      severity: 'error',
    }];
  }

  return [];
}
