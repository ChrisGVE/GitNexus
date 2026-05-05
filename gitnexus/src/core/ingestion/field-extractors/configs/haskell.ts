// gitnexus/src/core/ingestion/field-extractors/configs/haskell.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { FieldExtractionConfig } from '../generic.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

/**
 * Haskell field extraction config.
 *
 * Haskell record fields are declared inside `record` nodes within a
 * `data_type` or `newtype` declaration:
 *
 *   data User = User { name :: String, age :: Int }
 *
 * The tree-sitter-haskell AST represents each field as a `field` node
 * with a `field_name` child carrying the label.
 */
export const haskellFieldConfig: FieldExtractionConfig = {
  language: SupportedLanguages.Haskell,
  typeDeclarationNodes: ['data_type', 'newtype'],
  fieldNodeTypes: ['field'],
  bodyNodeTypes: ['record'],
  defaultVisibility: 'public',

  extractName(node: SyntaxNode): string | undefined {
    // field → field_name → text
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child?.type === 'field_name') return child.text;
    }
    return undefined;
  },

  extractType(node: SyntaxNode): string | undefined {
    // field → name (the type) or function (for function types)
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child?.type === 'name') return child.text;
      if (child?.type === 'function') return child.text?.trim();
      if (child?.type === 'apply') return child.text?.trim();
    }
    return undefined;
  },

  extractVisibility(_node: SyntaxNode) {
    // Haskell record fields are always public (module export list controls access)
    return 'public';
  },

  isStatic(_node: SyntaxNode) {
    return false;
  },

  isReadonly(_node: SyntaxNode) {
    // Haskell is immutable by default — all fields are effectively readonly
    return true;
  },
};
