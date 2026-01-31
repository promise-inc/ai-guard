import { AnalysisResult, Violation } from '../types';

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function severityIcon(severity: Violation['severity']): string {
  return severity === 'error' ? `${RED}\u2716${RESET}` : `${YELLOW}\u26A0${RESET}`;
}

function severityColor(severity: Violation['severity']): string {
  return severity === 'error' ? RED : YELLOW;
}

export function formatResult(analysis: AnalysisResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(`${BOLD}ai-guard${RESET} ${DIM}v0.1.0${RESET}`);
  lines.push('');

  if (analysis.passed) {
    lines.push(`  ${GREEN}\u2714${RESET} All files passed. No AI-generated patterns detected.`);
    lines.push('');
    return lines.join('\n');
  }

  for (const file of analysis.files) {
    lines.push(`  ${BOLD}${file.filePath}${RESET}`);
    for (const v of file.violations) {
      const lineRef = v.line ? `${DIM}:${v.line}${RESET}` : '';
      const icon = severityIcon(v.severity);
      const color = severityColor(v.severity);
      lines.push(`    ${icon} ${color}${v.message}${RESET}${lineRef}`);
    }
    lines.push('');
  }

  const errors = analysis.files.reduce(
    (sum, f) => sum + f.violations.filter((v) => v.severity === 'error').length,
    0,
  );
  const warnings = analysis.files.reduce(
    (sum, f) => sum + f.violations.filter((v) => v.severity === 'warning').length,
    0,
  );

  lines.push(`${DIM}---${RESET}`);
  lines.push(
    `  ${RED}${errors} error(s)${RESET}  ${YELLOW}${warnings} warning(s)${RESET}  ${DIM}in ${analysis.files.length} file(s)${RESET}`,
  );
  lines.push('');

  return lines.join('\n');
}
