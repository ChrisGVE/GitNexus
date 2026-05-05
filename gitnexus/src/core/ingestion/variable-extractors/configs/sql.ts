// gitnexus/src/core/ingestion/variable-extractors/configs/sql.ts
//
// SQL does not have module-level variable declarations in the grammar exposed
// by tree-sitter-sql@0.1.0 (DECLARE only appears inside function bodies and
// is not a top-level node type). No variable extraction is attempted.

import { SupportedLanguages } from 'gitnexus-shared';
import type { VariableExtractionConfig } from '../../variable-types.js';

export const sqlVariableConfig: VariableExtractionConfig = {
  language: SupportedLanguages.SQL,
  constNodeTypes: [],
  staticNodeTypes: [],
  variableNodeTypes: [],

  extractName(): undefined {
    return undefined;
  },

  extractType(): undefined {
    return undefined;
  },

  extractVisibility(): 'public' {
    return 'public';
  },

  isConst(): false {
    return false;
  },

  isStatic(): false {
    return false;
  },

  isMutable(): true {
    return true;
  },
};
