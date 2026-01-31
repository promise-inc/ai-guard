import { AnalysisResult, Violation } from '../types';

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const BRIGHT_CYAN = '\x1b[96m';
const WHITE = '\x1b[37m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const BG_RED = '\x1b[41m';
const BG_GREEN = '\x1b[42m';

function severityIcon(severity: Violation['severity']): string {
  return severity === 'error' ? `${RED}\u2716${RESET}` : `${YELLOW}\u26A0${RESET}`;
}

function severityColor(severity: Violation['severity']): string {
  return severity === 'error' ? RED : YELLOW;
}

function banner(): string[] {
  const lines: string[] = [];

  const title = [
    ' /$$$$$$  /$$$$$$        /$$$$$$                                      /$$',
    '/$$__  $$|_  $$_/       /$$__  $$                                    | $$',
    '| $$  \\ $$  | $$        | $$  \\__/ /$$   /$$  /$$$$$$   /$$$$$$   /$$$$$$$',
    '| $$$$$$$$  | $$        | $$ /$$$$| $$  | $$ |____  $$ /$$__  $$ /$$__  $$',
    '| $$__  $$  | $$        | $$|_  $$| $$  | $$  /$$$$$$$| $$  \\__/| $$  | $$',
    '| $$  | $$  | $$        | $$  \\ $$| $$  | $$ /$$__  $$| $$      | $$  | $$',
    '| $$  | $$ /$$$$$$      |  $$$$$$/|  $$$$$$/|  $$$$$$$| $$      |  $$$$$$$',
    '|__/  |__/|______/       \\______/  \\______/  \\_______/|__/       \\_______/',
  ];

  const subtitle = [
    "  _           ___               _           _         ",
    " | |__ _  _  | _ \\_ _ ___ _ __ (_)___ ___  (_)_ _  __ ",
    " | '_ \\ || | |  _/ '_/ _ \\ '  \\| (_-</ -_)_| | ' \\/ _|",
    " |_.__/\\_, | |_| |_| \\___/_|_|_|_/__/\\___(_)_|_||_\\__|",
    "       |__/",
  ];

  lines.push('');
  for (const line of title) {
    lines.push(`  ${BRIGHT_CYAN}${line}${RESET}`);
  }
  lines.push('');
  for (const line of subtitle) {
    lines.push(`  ${DIM}${line}${RESET}`);
  }
  lines.push(`  ${DIM}${'v0.1.0'.padStart(title[2].length)}${RESET}`);
  lines.push('');

  return lines;
}

export function formatResult(analysis: AnalysisResult): string {
  const lines: string[] = [...banner()];

  if (analysis.passed) {
    lines.push(`  ${BG_GREEN}${WHITE}${BOLD} PASS ${RESET} ${GREEN}All files passed.${RESET} ${DIM}No AI-generated patterns detected.${RESET}`);
    lines.push('');
    return lines.join('\n');
  }

  const totalErrors = analysis.files.reduce(
    (sum, f) => sum + f.violations.filter((v) => v.severity === 'error').length,
    0,
  );
  const totalWarnings = analysis.files.reduce(
    (sum, f) => sum + f.violations.filter((v) => v.severity === 'warning').length,
    0,
  );

  for (const file of analysis.files) {
    const fileErrors = file.violations.filter((v) => v.severity === 'error').length;
    const fileWarnings = file.violations.filter((v) => v.severity === 'warning').length;
    const counts: string[] = [];
    if (fileErrors > 0) counts.push(`${RED}${fileErrors} error${fileErrors > 1 ? 's' : ''}${RESET}`);
    if (fileWarnings > 0) counts.push(`${YELLOW}${fileWarnings} warning${fileWarnings > 1 ? 's' : ''}${RESET}`);

    lines.push(`  ${CYAN}${BOLD}\u25CF${RESET} ${BOLD}${file.filePath}${RESET} ${DIM}(${RESET}${counts.join(`${DIM}, ${RESET}`)}${DIM})${RESET}`);

    for (const v of file.violations) {
      const lineRef = v.line ? `${DIM}:${v.line}${RESET}` : '';
      const icon = severityIcon(v.severity);
      const color = severityColor(v.severity);
      lines.push(`    ${icon} ${color}${v.message}${RESET}${lineRef}`);
    }
    lines.push('');
  }

  lines.push(`  ${DIM}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`);

  const badge = totalErrors > 0
    ? `${BG_RED}${WHITE}${BOLD} FAIL ${RESET}`
    : `${YELLOW}${BOLD} WARN ${RESET}`;

  const parts: string[] = [];
  if (totalErrors > 0) parts.push(`${RED}${BOLD}${totalErrors}${RESET} ${RED}error${totalErrors > 1 ? 's' : ''}${RESET}`);
  if (totalWarnings > 0) parts.push(`${YELLOW}${BOLD}${totalWarnings}${RESET} ${YELLOW}warning${totalWarnings > 1 ? 's' : ''}${RESET}`);
  parts.push(`${DIM}in ${BOLD}${analysis.files.length}${RESET}${DIM} file${analysis.files.length > 1 ? 's' : ''}${RESET}`);

  lines.push(`  ${badge} ${parts.join(`${DIM}  \u00B7  ${RESET}`)}`);
  lines.push('');

  return lines.join('\n');
}
