import * as fs from 'fs/promises';
import * as path from 'path';
import { AiGuardConfig, DEFAULT_CONFIG } from './types';

const CONFIG_FILES = [
  'ai-guard.config.ts',
  'ai-guard.config.js',
];

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadFromPackageJson(cwd: string): Promise<Partial<AiGuardConfig> | null> {
  const pkgPath = path.join(cwd, 'package.json');
  if (!(await fileExists(pkgPath))) return null;

  const content = await fs.readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(content);
  return pkg['ai-guard'] ?? null;
}

async function loadFromConfigFile(cwd: string): Promise<Partial<AiGuardConfig> | null> {
  for (const configFile of CONFIG_FILES) {
    const configPath = path.join(cwd, configFile);
    if (await fileExists(configPath)) {
      const absolutePath = path.resolve(configPath);

      if (configFile.endsWith('.ts')) {
        try {
          require('ts-node/register/transpile-only');
        } catch {
          // ts-node not available — skip .ts config
          continue;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require(absolutePath);
      return mod.default ?? mod;
    }
  }
  return null;
}

export async function loadConfig(cwd: string = process.cwd()): Promise<AiGuardConfig> {
  const fromFile = await loadFromConfigFile(cwd);
  if (fromFile) {
    return mergeConfig(fromFile);
  }

  const fromPkg = await loadFromPackageJson(cwd);
  if (fromPkg) {
    return mergeConfig(fromPkg);
  }

  return { ...DEFAULT_CONFIG };
}

function mergeConfig(partial: Partial<AiGuardConfig>): AiGuardConfig {
  return {
    ...DEFAULT_CONFIG,
    ...partial,
    aiPatterns: {
      ...DEFAULT_CONFIG.aiPatterns,
      ...partial.aiPatterns,
    },
  };
}
