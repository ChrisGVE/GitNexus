import { SupportedLanguages } from 'gitnexus-shared';
import type { FieldExtractionConfig } from '../generic.js';

export const bashFieldConfig: FieldExtractionConfig = {
  language: SupportedLanguages.Bash,
  typeDeclarationNodes: [],
  fieldNodeTypes: [],
  bodyNodeTypes: [],
  defaultVisibility: 'public',

  extractName(_node) {
    return undefined;
  },
  extractType(_node) {
    return undefined;
  },
  extractVisibility(_node) {
    return 'public';
  },
  isStatic(_node) {
    return false;
  },
  isReadonly(_node) {
    return false;
  },
};
