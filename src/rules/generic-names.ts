import { Project, SyntaxKind } from 'ts-morph';
import { AiGuardConfig, Violation } from '../types';

export const name = 'generic-names';
export const description = 'Detects generic variable/function names typical of AI-generated code';

export function analyze(filePath: string, config: AiGuardConfig): Violation[] {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFile = project.addSourceFileAtPath(filePath);
  const violations: Violation[] = [];
  const forbidden = new Set(config.forbidGenericNames.map((n) => n.toLowerCase()));

  // Check variable declarations
  sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((decl) => {
    const varName = decl.getName();
    if (forbidden.has(varName.toLowerCase())) {
      violations.push({
        rule: name,
        file: filePath,
        message: `Generic variable name: "${varName}"`,
        line: decl.getStartLineNumber(),
        severity: 'warning',
      });
    }
  });

  // Check function declarations
  sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration).forEach((func) => {
    const funcName = func.getName();
    if (funcName && forbidden.has(funcName.toLowerCase())) {
      violations.push({
        rule: name,
        file: filePath,
        message: `Generic function name: "${funcName}"`,
        line: func.getStartLineNumber(),
        severity: 'warning',
      });
    }
  });

  // Check parameters
  sourceFile.getDescendantsOfKind(SyntaxKind.Parameter).forEach((param) => {
    const paramName = param.getName();
    if (forbidden.has(paramName.toLowerCase())) {
      // Allow common callback params like (item) => in .map/.filter/.reduce
      const parent = param.getParent();
      const isShortCallback =
        parent &&
        (parent.isKind(SyntaxKind.ArrowFunction) || parent.isKind(SyntaxKind.FunctionExpression)) &&
        parent.getParameters().length <= 2;

      if (!isShortCallback) {
        violations.push({
          rule: name,
          file: filePath,
          message: `Generic parameter name: "${paramName}"`,
          line: param.getStartLineNumber(),
          severity: 'warning',
        });
      }
    }
  });

  return violations;
}
