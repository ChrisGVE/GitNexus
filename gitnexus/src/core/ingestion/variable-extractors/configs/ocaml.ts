// gitnexus/src/core/ingestion/variable-extractors/configs/ocaml.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { VariableExtractionConfig } from '../../variable-types.js';
import type { VariableVisibility } from '../../variable-types.js';

/**
 * OCaml variable extraction config.
 *
 * OCaml top-level bindings use `let name = expr` (value_definition > let_binding).
 * Since the tree-sitter query already captures value_definition as @definition.function
 * or @definition.const, we keep variableNodeTypes minimal to avoid double-counting.
 *
 * Ref cells (`let counter = ref 0`) are the closest OCaml analogue to a
 * mutable variable at module scope.
 */
export const ocamlVariableConfig: VariableExtractionConfig = {
  language: SupportedLanguages.OCaml,
  constNodeTypes: [],
  staticNodeTypes: [],
  variableNodeTypes: [],

  extractName(_node) {
    return undefined;
  },

  extractType(_node) {
    return undefined;
  },

  extractVisibility(_node): VariableVisibility {
    return 'public';
  },

  isConst(_node) {
    return false;
  },

  isStatic(_node) {
    return false;
  },

  isMutable(_node) {
    return false;
  },
};
