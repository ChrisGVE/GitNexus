// gitnexus/src/core/ingestion/variable-extractors/configs/elixir.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { VariableExtractionConfig } from '../../variable-types.js';

/**
 * Elixir variable extraction config.
 *
 * Elixir uses immutable bindings. Module-level constants are defined via
 * module attributes (`@attribute value`) or plain match operators at the
 * module scope. For the purposes of the graph, we capture module-level
 * bindings expressed as binary_operator (match operator `=`) at the top
 * of a module body. Standard variable declarations inside functions are
 * not captured here — only module-scope matches.
 */
export const elixirVariableConfig: VariableExtractionConfig = {
  language: SupportedLanguages.Elixir,
  constNodeTypes: [],
  staticNodeTypes: [],
  variableNodeTypes: ['binary_operator'],

  extractName(node) {
    // Match operator: left = right
    if (node.childForFieldName?.('operator')?.text !== '=') return undefined;
    const left = node.childForFieldName?.('left');
    if (!left) return undefined;
    if (left.type === 'identifier') return left.text;
    return undefined;
  },

  extractType(_node) {
    // Elixir is dynamically typed
    return undefined;
  },

  extractVisibility(_node) {
    return 'public' as const;
  },

  isConst(_node) {
    return false;
  },

  isStatic(_node) {
    return false;
  },

  isMutable(_node) {
    // Elixir bindings are immutable by convention
    return false;
  },
};
