// gitnexus/src/core/ingestion/variable-extractors/configs/zig.ts
// Verified against tree-sitter-zig 0.2.0
//
// Zig uses assignment_statement for both const and var declarations:
//   const x: i32 = 42;
//   var y: u8 = 0;
//   pub const MAX: u32 = 100;
//
// assignment_statement fields:
//   name: (identifier)      — variable name
//   type: (_type)?          — optional type annotation
//   expression: (_)         — initial value
//
// Children: optional visibility_modifier (pub), optional assignment_modifier
// (threadlocal, comptime). The choice of 'const' vs 'var' keyword is an
// unnamed token — we detect it by scanning child text.

import { SupportedLanguages } from 'gitnexus-shared';
import type { VariableExtractionConfig, VariableVisibility } from '../../variable-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

function hasVisibilityModifier(node: SyntaxNode): boolean {
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child?.type === 'visibility_modifier') return true;
  }
  return false;
}

/** Scan unnamed token children for the 'const' or 'var' keyword. */
function getVarKind(node: SyntaxNode): 'const' | 'var' | null {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!child) continue;
    if (child.text === 'const') return 'const';
    if (child.text === 'var') return 'var';
  }
  return null;
}

export const zigVariableConfig: VariableExtractionConfig = {
  language: SupportedLanguages.Zig,
  constNodeTypes: ['assignment_statement'],
  staticNodeTypes: [],
  variableNodeTypes: ['assignment_statement'],

  extractName(node: SyntaxNode) {
    return node.childForFieldName('name')?.text;
  },

  extractType(node: SyntaxNode) {
    return node.childForFieldName('type')?.text?.trim();
  },

  extractVisibility(node: SyntaxNode): VariableVisibility {
    return hasVisibilityModifier(node) ? 'public' : 'private';
  },

  isConst(node: SyntaxNode) {
    return getVarKind(node) === 'const';
  },

  isStatic(_node: SyntaxNode) {
    return false;
  },

  isMutable(node: SyntaxNode) {
    return getVarKind(node) === 'var';
  },
};
