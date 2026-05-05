// gitnexus/src/core/ingestion/method-extractors/configs/zig.ts
// Verified against tree-sitter-zig 0.2.0
//
// In Zig, functions defined inside a struct body are regular function_declaration
// nodes. Zig has no classes or methods in the OO sense, but struct-scoped
// functions act as methods. We extract them from struct_expression bodies.
//
// function_declaration fields:
//   name: (identifier)          — the function name
//   parameters: (parameters)    — parameter list
//   return: …                   — return type (various expression types)
//   body: (block)               — function body
//
// Visibility: presence of visibility_modifier child (pub).
// Async: presence of function_modifiers with 'async'.

import { SupportedLanguages } from 'gitnexus-shared';
import type {
  MethodExtractionConfig,
  ParameterInfo,
  MethodVisibility,
} from '../../method-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

function extractZigMethodName(node: SyntaxNode): string | undefined {
  return node.childForFieldName('name')?.text;
}

function extractZigReturnType(node: SyntaxNode): string | undefined {
  const ret = node.childForFieldName('return');
  return ret?.text?.trim();
}

function extractZigParameters(node: SyntaxNode): ParameterInfo[] {
  const paramList = node.childForFieldName('parameters');
  if (!paramList) return [];
  const params: ParameterInfo[] = [];

  for (let i = 0; i < paramList.namedChildCount; i++) {
    const param = paramList.namedChild(i);
    if (!param) continue;

    if (param.type === 'parameter') {
      // parameter has a name (identifier or pattern) and a type
      // tree-sitter-zig parameter fields vary — try field names first
      const nameNode = param.childForFieldName('name') ?? param.firstNamedChild;
      const typeNode = param.childForFieldName('type');
      params.push({
        name: nameNode?.text ?? '?',
        type: typeNode?.text?.trim() ?? null,
        rawType: typeNode?.text?.trim() ?? null,
        isOptional: false,
        isVariadic: false,
      });
    } else if (param.type === 'variadic_parameter') {
      // `...` variadic parameter
      params.push({
        name: '...',
        type: null,
        rawType: null,
        isOptional: false,
        isVariadic: true,
      });
    }
  }
  return params;
}

function extractZigVisibility(node: SyntaxNode): MethodVisibility {
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child?.type === 'visibility_modifier') return 'public';
  }
  return 'private';
}

function isZigAsync(node: SyntaxNode): boolean {
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child?.type === 'function_modifiers' && child.text.includes('async')) return true;
  }
  return false;
}

export const zigMethodConfig: MethodExtractionConfig = {
  language: SupportedLanguages.Zig,
  // Struct bodies (struct_expression) contain function_declaration nodes as methods
  typeDeclarationNodes: ['struct_expression'],
  methodNodeTypes: ['function_declaration'],
  bodyNodeTypes: ['struct_expression'],

  extractName: extractZigMethodName,
  extractReturnType: extractZigReturnType,
  extractParameters: extractZigParameters,
  extractVisibility: extractZigVisibility,

  extractOwnerName(node: SyntaxNode) {
    // For struct_expression, the owner name comes from the enclosing
    // assignment_statement's name field.
    if (node.type !== 'struct_expression') return undefined;
    const parent = node.parent;
    if (!parent) return undefined;
    // assignment_statement has name field
    const nameNode = parent.childForFieldName?.('name');
    return nameNode?.text;
  },

  isStatic(_node: SyntaxNode) {
    // Zig does not have instance vs static distinction at the language level.
    // All struct functions take the self parameter explicitly as a first arg.
    // We treat all as non-static for now.
    return false;
  },

  isAbstract(_node: SyntaxNode, _ownerNode: SyntaxNode) {
    return false; // Zig has no abstract methods
  },

  isFinal(_node: SyntaxNode) {
    return false; // Zig has no final concept
  },

  isAsync: isZigAsync,
};
