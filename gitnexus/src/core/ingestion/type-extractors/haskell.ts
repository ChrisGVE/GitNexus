/**
 * Haskell type extractor.
 *
 * Haskell is statically typed but the type information is attached via
 * separate `signature` nodes, not inline on the binding node.  Because
 * tree-sitter-haskell places the signature as a sibling of the function
 * definition (not as a child), standard parameter-type extraction
 * cannot infer types from the function node alone.
 *
 * We provide minimal stubs that satisfy the LanguageTypeConfig contract:
 * - extractDeclaration: no-op (no inline type annotations on bindings)
 * - extractParameter:   no-op (patterns have no type labels in the AST)
 *
 * Cross-file call resolution works through the name-based call graph.
 * Type-based virtual dispatch is not applicable to Haskell's structural
 * type class system.
 */

import type { LanguageTypeConfig, TypeBindingExtractor, ParameterExtractor } from './types.js';

const HASKELL_DECLARATION_NODE_TYPES: ReadonlySet<string> = new Set([
  'function',
  'bind',
  'signature',
]);

const extractDeclaration: TypeBindingExtractor = (_node, _env): void => {
  // Haskell bindings have no inline type annotations on the node itself.
};

const extractParameter: ParameterExtractor = (_node, _env): void => {
  // Haskell pattern parameters carry no type labels in tree-sitter.
};

export const typeConfig: LanguageTypeConfig = {
  declarationNodeTypes: HASKELL_DECLARATION_NODE_TYPES,
  extractDeclaration,
  extractParameter,
};
