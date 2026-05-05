/**
 * Erlang type extractor.
 *
 * Erlang is dynamically typed with optional -spec annotations. There are no
 * inline variable type declarations; the type system is built on specs and
 * dialyzer analysis, which are not reflected in the AST at this level.
 *
 * Tier 0: No explicit type declarations (Erlang has none in function bodies).
 * Tier 0b: No for-loop bindings (Erlang uses list comprehensions, not for loops).
 * Tier 1: No constructor inference (no class system).
 *
 * This is a minimal config that satisfies the LanguageTypeConfig contract
 * without performing any type extraction.
 */

import type { LanguageTypeConfig } from './types.js';

export const typeConfig: LanguageTypeConfig = {
  declarationNodeTypes: new Set(),
  extractDeclaration: () => {},
  extractParameter: () => {},
};
