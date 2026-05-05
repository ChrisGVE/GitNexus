// gitnexus/src/core/ingestion/variable-extractors/configs/haskell.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { VariableExtractionConfig } from '../../variable-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

/**
 * Haskell variable extraction config.
 *
 * In Haskell, top-level bindings (function or bind nodes in `declarations`)
 * that are not function definitions (i.e., no pattern arguments) are treated
 * as variable declarations.  Examples:
 *
 *   maxSize = 100
 *   greeting = "Hello, world!"
 *
 * The AST uses `bind` for do-notation bindings and `function` for top-level
 * definitions.  We re-use `bind` as a variable node type for simple bindings.
 */

function extractHaskellVarName(node: SyntaxNode): string | undefined {
  const first = node.namedChild(0);
  if (first?.type === 'variable') return first.text;
  return undefined;
}

export const haskellVariableConfig: VariableExtractionConfig = {
  language: SupportedLanguages.Haskell,
  constNodeTypes: [],
  staticNodeTypes: [],
  variableNodeTypes: ['bind'],

  extractName: extractHaskellVarName,

  extractType(_node: SyntaxNode): string | undefined {
    // Haskell variables at module level do not have inline type annotations
    // on the binding node itself — type is on a separate signature node.
    return undefined;
  },

  extractVisibility(_node: SyntaxNode) {
    // All top-level Haskell bindings are public (module export list controls access)
    return 'public';
  },

  isConst(_node: SyntaxNode) {
    return true; // Haskell bindings are immutable
  },

  isStatic(_node: SyntaxNode) {
    return false;
  },

  isMutable(_node: SyntaxNode) {
    return false; // Haskell is immutable by default
  },
};
