export interface AiGuardConfig {
  maxCommentsRatio: number;
  forbidGenericNames: string[];
  maxFunctionLines: number;
  aiPatterns: {
    forbid: string[];
  };
  architecture: Record<string, string[]>;
  include: string[];
  exclude: string[];
}

export interface Violation {
  rule: string;
  file: string;
  message: string;
  line?: number;
  severity: 'error' | 'warning';
}

export interface FileAnalysis {
  filePath: string;
  violations: Violation[];
}

export interface AnalysisResult {
  files: FileAnalysis[];
  totalViolations: number;
  passed: boolean;
}

export interface Rule {
  name: string;
  description: string;
  analyze: (filePath: string, config: AiGuardConfig) => Violation[];
}

export const DEFAULT_CONFIG: AiGuardConfig = {
  maxCommentsRatio: 0.15,
  forbidGenericNames: [
    'data', 'result', 'item', 'items', 'value', 'values',
    'temp', 'tmp', 'obj', 'arr', 'val', 'res', 'ret',
    'output', 'input', 'response', 'info', 'stuff',
  ],
  maxFunctionLines: 60,
  aiPatterns: {
    forbid: [
      'this function',
      'the purpose of',
      'we will',
      'this method',
      'this class',
      'the following',
      'as follows',
      'note that',
      'please note',
      'make sure to',
      'don\'t forget to',
      'TODO: implement',
      'TODO: add',
    ],
  },
  architecture: {},
  include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.next/**',
    'coverage/**',
    '**/*.d.ts',
    '**/*.test.*',
    '**/*.spec.*',
    'test-fixture/**',
  ],
};
