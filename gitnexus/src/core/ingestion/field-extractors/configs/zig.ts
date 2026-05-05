// gitnexus/src/core/ingestion/field-extractors/configs/zig.ts
// Verified against tree-sitter-zig 0.2.0
//
// Zig struct fields live inside struct_expression nodes.
// field_declaration has: name (field_identifier), type (_type), optional default.
// Visibility: `pub` keyword appears as a visibility_modifier child.
// All fields are immutable by default (mutability lives on bindings, not fields).

import { SupportedLanguages } from 'gitnexus-shared';
import type { FieldExtractionConfig } from '../generic.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

export const zigFieldConfig: FieldExtractionConfig = {
  language: SupportedLanguages.Zig,
  // struct_expression is the "body" of a Zig struct type
  typeDeclarationNodes: ['struct_expression'],
  fieldNodeTypes: ['field_declaration'],
  bodyNodeTypes: ['struct_expression'],
  defaultVisibility: 'private',

  extractName(node: SyntaxNode) {
    const nameNode = node.childForFieldName('name');
    return nameNode?.text;
  },

  extractType(node: SyntaxNode) {
    const typeNode = node.childForFieldName('type');
    return typeNode?.text?.trim();
  },

  extractVisibility(node: SyntaxNode) {
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child?.type === 'visibility_modifier') return 'public';
    }
    return 'private';
  },

  isStatic(_node: SyntaxNode) {
    return false; // Zig struct fields are never static
  },

  isReadonly(_node: SyntaxNode) {
    // All Zig struct fields are effectively immutable by default;
    // mutability is controlled at the binding level (`var` vs `const`).
    return true;
  },
};
