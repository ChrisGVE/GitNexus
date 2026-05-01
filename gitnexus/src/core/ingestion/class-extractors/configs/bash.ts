import { SupportedLanguages } from 'gitnexus-shared';
import type { ClassExtractionConfig } from '../../class-types.js';

export const bashClassConfig: ClassExtractionConfig = {
  language: SupportedLanguages.Bash,
  typeDeclarationNodes: [],
  fileScopeNodeTypes: ['program'],
};
