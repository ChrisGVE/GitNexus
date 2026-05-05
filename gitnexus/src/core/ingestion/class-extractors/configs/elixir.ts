// gitnexus/src/core/ingestion/class-extractors/configs/elixir.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { ClassExtractionConfig } from '../../class-types.js';

/**
 * Elixir class extraction config.
 *
 * Elixir uses `defmodule` as its primary organizational unit. The tree-sitter
 * query captures `@definition.class` for `defmodule` nodes, and the `@name`
 * capture provides the qualified module name (e.g. "ElixirApp.App").
 *
 * We intentionally leave `typeDeclarationNodes` empty so the generic class
 * extractor never overrides the correct name supplied by the `@name` capture.
 * Elixir module names are fully qualified (e.g. "MyApp.Foo.Bar") and are
 * captured directly as `alias` nodes, which `nameNode.text` returns correctly.
 */
export const elixirClassConfig: ClassExtractionConfig = {
  language: SupportedLanguages.Elixir,
  typeDeclarationNodes: [],
  ancestorScopeNodeTypes: [],
};
