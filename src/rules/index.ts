import { AiGuardConfig, Violation } from '../types';
import * as excessiveComments from './excessive-comments';
import * as obviousComments from './obvious-comments';
import * as genericNames from './generic-names';
import * as largeFunctions from './large-functions';
import * as aiPatterns from './ai-patterns';

export interface RuleModule {
  name: string;
  description: string;
  analyze: (filePath: string, config: AiGuardConfig) => Violation[];
}

export const ALL_RULES: RuleModule[] = [
  excessiveComments,
  obviousComments,
  genericNames,
  largeFunctions,
  aiPatterns,
];
