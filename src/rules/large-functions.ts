import { Project, SyntaxKind } from 'ts-morph';
import { AiGuardConfig, Violation } from '../types';

export const name = 'large-functions';
export const description = 'Detects functions that exceed the maximum line count';

export function analyze(filePath: string, config: AiGuardConfig): Violation[] {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFile = project.addSourceFileAtPath(filePath);
  const violations: Violation[] = [];

  // Function declarations
  sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration).forEach((func) => {
    const lineCount = func.getEndLineNumber() - func.getStartLineNumber() + 1;
    if (lineCount > config.maxFunctionLines) {
      violations.push({
        rule: name,
        file: filePath,
        message: `Function "${func.getName() ?? 'anonymous'}" too large (${lineCount} lines — max ${config.maxFunctionLines})`,
        line: func.getStartLineNumber(),
        severity: 'error',
      });
    }
  });

  // Arrow functions (only named via variable)
  sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction).forEach((arrow) => {
    const lineCount = arrow.getEndLineNumber() - arrow.getStartLineNumber() + 1;
    if (lineCount > config.maxFunctionLines) {
      const parent = arrow.getParent();
      let funcName = 'anonymous';
      if (parent && parent.isKind(SyntaxKind.VariableDeclaration)) {
        funcName = parent.getName();
      }
      violations.push({
        rule: name,
        file: filePath,
        message: `Arrow function "${funcName}" too large (${lineCount} lines — max ${config.maxFunctionLines})`,
        line: arrow.getStartLineNumber(),
        severity: 'error',
      });
    }
  });

  // Method declarations
  sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration).forEach((method) => {
    const lineCount = method.getEndLineNumber() - method.getStartLineNumber() + 1;
    if (lineCount > config.maxFunctionLines) {
      violations.push({
        rule: name,
        file: filePath,
        message: `Method "${method.getName()}" too large (${lineCount} lines — max ${config.maxFunctionLines})`,
        line: method.getStartLineNumber(),
        severity: 'error',
      });
    }
  });

  return violations;
}
