/**
 * Elixir type extractor.
 *
 * Elixir is dynamically typed. There are no type annotations in standard
 * Elixir syntax (Elixir's typespecs via @spec are documentation-only and
 * not enforced at runtime). This extractor provides a minimal config that
 * records no type bindings, allowing the pipeline to skip type resolution
 * for Elixir without errors.
 */

import type { LanguageTypeConfig } from './types.js';

const ELIXIR_DECLARATION_NODE_TYPES: ReadonlySet<string> = new Set([
  // `=` (match operator) used as a binding
  'binary_operator',
]);

export const typeConfig: LanguageTypeConfig = {
  declarationNodeTypes: ELIXIR_DECLARATION_NODE_TYPES,

  extractDeclaration(_node, _env) {
    // Elixir has no static type annotations — no-op
  },

  extractParameter(_node, _env) {
    // Elixir has no static type annotations — no-op
  },
};
