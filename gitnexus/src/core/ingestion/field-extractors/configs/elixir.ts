// gitnexus/src/core/ingestion/field-extractors/configs/elixir.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { FieldExtractionConfig } from '../generic.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

/**
 * Elixir field extraction config.
 *
 * Elixir has no field declarations in the traditional sense. Struct fields are
 * declared via `defstruct [:field1, :field2]` at module level, but these are
 * complex to extract generically. For now we focus on the common case where
 * fields appear as `@attribute` module attributes (which use unary_operator in
 * the grammar, not a conventional field node type). Since those don't fit the
 * generic factory model, we use empty fieldNodeTypes and rely on the method
 * extractor to capture module functions instead.
 */
export const elixirFieldConfig: FieldExtractionConfig = {
  language: SupportedLanguages.Elixir,
  typeDeclarationNodes: ['call'],
  fieldNodeTypes: [],
  bodyNodeTypes: ['do_block'],
  defaultVisibility: 'public',

  extractName(_node: SyntaxNode): string | undefined {
    return undefined;
  },

  extractType(_node: SyntaxNode): string | undefined {
    return undefined;
  },

  extractVisibility(_node: SyntaxNode) {
    return 'public' as const;
  },

  isStatic(_node: SyntaxNode): boolean {
    return false;
  },

  isReadonly(_node: SyntaxNode): boolean {
    return false;
  },
};
