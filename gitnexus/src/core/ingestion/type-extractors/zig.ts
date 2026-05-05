// gitnexus/src/core/ingestion/type-extractors/zig.ts
// Verified against tree-sitter-zig 0.2.0
//
// Minimal type extraction for Zig.
//
// Zig is statically typed; every variable declaration can carry an explicit
// type annotation (the `type` field on assignment_statement).  Parameters
// in function_declaration use `parameter` child nodes with name/type fields.
//
// We extract:
//   - assignment_statement: const/var declarations with explicit type → (name, type)
//   - parameter nodes inside function_declaration → (name, type)

import type { SyntaxNode } from '../utils/ast-helpers.js';
import type { LanguageTypeConfig, TypeBindingExtractor, ParameterExtractor } from './types.js';
import { extractSimpleTypeName, extractVarName } from './shared.js';

const DECLARATION_NODE_TYPES: ReadonlySet<string> = new Set(['assignment_statement']);

/**
 * Extract type binding from a Zig assignment_statement:
 *   const x: i32 = 42;  →  env.set('x', 'i32')
 *   var buf: []u8 = ...;  →  env.set('buf', '[]u8')
 * Declarations without an explicit type annotation are skipped.
 */
const extractDeclaration: TypeBindingExtractor = (node: SyntaxNode, env: Map<string, string>) => {
  if (node.type !== 'assignment_statement') return;

  const nameNode = node.childForFieldName('name');
  const typeNode = node.childForFieldName('type');
  if (!nameNode || !typeNode) return;

  const varName = extractVarName(nameNode);
  const typeName = extractSimpleTypeName(typeNode) ?? typeNode.text?.trim();
  if (varName && typeName) env.set(varName, typeName);
};

/**
 * Extract type binding from a Zig function parameter:
 *   fn foo(x: i32, buf: []u8) void { ... }
 * Emits env entries for each named parameter with an explicit type.
 */
const extractParameter: ParameterExtractor = (node: SyntaxNode, env: Map<string, string>) => {
  if (node.type !== 'parameter') return;

  // tree-sitter-zig parameter children: the name is typically the first
  // identifier child, and the type follows after ':'.
  // Try field-name lookup first (grammar may use 'name'/'type' fields),
  // then fall back to child scan.
  const nameNode = node.childForFieldName('name') ?? node.firstNamedChild;
  const typeNode = node.childForFieldName('type');

  if (!nameNode || !typeNode) return;

  const varName = extractVarName(nameNode);
  const typeName = extractSimpleTypeName(typeNode) ?? typeNode.text?.trim();
  if (varName && typeName) env.set(varName, typeName);
};

export const typeConfig: LanguageTypeConfig = {
  declarationNodeTypes: DECLARATION_NODE_TYPES,
  extractDeclaration,
  extractParameter,
};
