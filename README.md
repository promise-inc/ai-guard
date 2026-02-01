# @promise-inc/ai-guard

Detect AI-generated code patterns before commit/push. Not a linter — a guard.

<p align="center">
  <img src="https://raw.githubusercontent.com/promise-inc/ai-guard/main/assets/demo.svg" alt="ai-guard CLI output demo" width="680" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/promise-inc/ai-guard/main/assets/usage.svg" alt="ai-guard config example" width="680" />
</p>

## Why?

AI tools generate code that works but often carries patterns that degrade codebases over time:

- Excessive comments that restate the obvious
- Generic variable names (`data`, `result`, `item`)
- Functions that are way too large
- `// Step 1:` style comments
- Verbose JSDoc blocks with no real information

`ai-guard` catches these patterns **before they reach your codebase**.

## Install

```bash
npm install @promise-inc/ai-guard --save-dev
```

## Usage

```bash
# Analyze the entire project
npx ai-guard

# Analyze only staged files (for pre-commit hooks)
npx ai-guard --staged
```

### As a Git Hook

```json
{
  "husky": {
    "hooks": {
      "pre-push": "ai-guard"
    }
  }
}
```

Or with `lint-staged`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": "ai-guard --staged"
  }
}
```

## Rules

| Rule | What it detects | Severity |
|------|----------------|----------|
| `excessive-comments` | Files where comment ratio exceeds threshold | error |
| `obvious-comments` | Redundant comments like `// Initialize the result` | warning |
| `generic-names` | Variables/functions named `data`, `result`, `item`, etc. | warning |
| `large-functions` | Functions exceeding the line limit | error |
| `ai-patterns` | `// Step 1:`, `// Helper function`, verbose JSDoc, forbidden text patterns | warning/error |

## Configuration

Create `ai-guard.config.ts`, `ai-guard.config.js`, or add an `ai-guard` field to `package.json`:

```ts
export default {
  maxCommentsRatio: 0.15,
  maxFunctionLines: 60,
  forbidGenericNames: ["data", "result", "item", "value", "temp"],
  aiPatterns: {
    forbid: [
      "this function",
      "the purpose of",
      "we will",
      "this method",
      "note that",
    ],
  },
  include: ["**/*.ts", "**/*.tsx"],
  exclude: ["node_modules/**", "dist/**", "**/*.test.*"],
};
```

### Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxCommentsRatio` | `number` | `0.15` | Max ratio of comment lines to total lines |
| `maxFunctionLines` | `number` | `60` | Max lines per function/method |
| `forbidGenericNames` | `string[]` | `["data", "result", ...]` | Banned variable/function names |
| `aiPatterns.forbid` | `string[]` | `["this function", ...]` | Forbidden phrases in comments |
| `include` | `string[]` | `["**/*.ts", "**/*.tsx", ...]` | File patterns to analyze |
| `exclude` | `string[]` | `["node_modules/**", ...]` | File patterns to skip |

## Programmatic API

```ts
import { analyzeProject, loadConfig } from "@promise-inc/ai-guard";

const config = await loadConfig(process.cwd());
const analysis = await analyzeProject(process.cwd(), config);

console.log(analysis.passed); // true | false
console.log(analysis.totalViolations); // number
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All files passed |
| `1` | Violations found |
| `2` | Internal error |

## Design Principles

- **Fast** — AST-based analysis, no network calls
- **Deterministic** — Same input always produces same output
- **CI-friendly** — Exit codes, no interactive prompts
- **Zero external dependencies** — Only `ts-morph` for AST parsing
- **Not a linter** — Focused exclusively on AI-generated code patterns

## How to report bugs

To report a bug, please first read our guide on [opening issues](https://github.com/promise-inc/ai-guard/issues).

## How to contribute code

To open a pull request, please first read our guide on [opening pull requests](https://github.com/promise-inc/ai-guard/pulls), which outlines our process for RFCs and pull requests.

## Also by Promise Inc.

| Package | Description |
|---------|-------------|
| [`@promise-inc/ps-guard`](https://github.com/promise-inc/ps-guard) | Lighthouse-based performance guard |
| [`@promise-inc/fs-guard`](https://github.com/promise-inc/fs-guard) | Validate project folder and file structure |
| [`@promise-inc/devlog`](https://github.com/promise-inc/devlog) | Logger with automatic context (file + line) |
| [`@promise-inc/ui-states`](https://github.com/promise-inc/ui-states) | Auto-generated skeleton loading states |
| [`@promise-inc/dev-reel`](https://github.com/promise-inc/dev-reel) | Animated SVG previews for READMEs |

---

Developed by [Promise Inc.](https://promise.codes)

## License

MIT © [Promise Inc.](https://promise.codes)
