// gitnexus/src/core/ingestion/variable-extractors/configs/erlang.ts
//
// Erlang has no module-level variable declarations in the traditional sense.
// Module-level "constants" are typically 0-arity functions or macros defined
// with -define(). We do not model -define() macros as variable nodes; the
// extractor is therefore a no-op stub that satisfies the interface contract.

import { SupportedLanguages } from 'gitnexus-shared';
import type { VariableExtractionConfig } from '../../variable-types.js';

export const erlangVariableConfig: VariableExtractionConfig = {
  language: SupportedLanguages.Erlang,
  constNodeTypes: [],
  staticNodeTypes: [],
  variableNodeTypes: [],

  extractName(_node) {
    return undefined;
  },

  extractType(_node) {
    return undefined;
  },

  extractVisibility(_node) {
    return 'public';
  },

  isConst(_node) {
    return false;
  },

  isStatic(_node) {
    return false;
  },

  isMutable(_node) {
    return true;
  },
};
