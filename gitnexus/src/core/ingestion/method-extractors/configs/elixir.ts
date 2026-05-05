// gitnexus/src/core/ingestion/method-extractors/configs/elixir.ts
// Verified against tree-sitter-elixir 0.3.5

import { SupportedLanguages } from 'gitnexus-shared';
import type { MethodExtractionConfig, ParameterInfo } from '../../method-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

/**
 * Extract the function name from an Elixir `def`/`defp`/`defmacro`/`defmacrop` call node.
 *
 * The structure is:
 *   (call target: (identifier "def")
 *     (arguments
 *       (call target: (identifier @name)
 *             (arguments ...))
 *       ...))
 *
 * For zero-arity forms (def name, do: expr), the argument is a bare identifier.
 */
function extractElixirMethodName(node: SyntaxNode): string | undefined {
  const args = node.childForFieldName?.('arguments');
  if (!args) return undefined;
  const first = args.namedChild(0);
  if (!first) return undefined;

  // Regular form: first arg is a call node whose target is the function name
  if (first.type === 'call') {
    const target = first.childForFieldName?.('target');
    if (target?.type === 'identifier') return target.text;
  }
  // Zero-arity inline form: first arg is a bare identifier
  if (first.type === 'identifier') return first.text;

  return undefined;
}

/**
 * Extract parameters from a def/defp call.
 *
 * The inner call (function_name(params)) carries the arguments node.
 */
function extractElixirParameters(node: SyntaxNode): ParameterInfo[] {
  const args = node.childForFieldName?.('arguments');
  if (!args) return [];
  const first = args.namedChild(0);
  if (!first || first.type !== 'call') return [];

  const innerArgs = first.childForFieldName?.('arguments');
  if (!innerArgs) return [];

  const params: ParameterInfo[] = [];
  for (let i = 0; i < innerArgs.namedChildCount; i++) {
    const child = innerArgs.namedChild(i);
    if (!child) continue;
    // Parameters can be identifiers, or patterns (binary_operator with =, etc.)
    let name: string;
    if (child.type === 'identifier') {
      name = child.text;
    } else {
      // Fall back to raw text for destructured patterns
      name = child.text.replace(/\s+/g, ' ').slice(0, 40);
    }
    params.push({ name, type: null, isOptional: false, isVariadic: false });
  }
  return params;
}

/**
 * Determine visibility for an Elixir function definition node.
 * `def` → public; `defp` / `defmacrop` / `defguardp` → private.
 */
function extractElixirVisibility(node: SyntaxNode): 'public' | 'private' {
  const target = node.childForFieldName?.('target');
  if (target?.type === 'identifier') {
    const kw = target.text;
    if (kw === 'defp' || kw === 'defmacrop' || kw === 'defguardp') return 'private';
  }
  return 'public';
}

export const elixirMethodConfig: MethodExtractionConfig = {
  language: SupportedLanguages.Elixir,
  // A module is a `call` node whose target identifier is "defmodule"
  typeDeclarationNodes: ['call'],
  // Functions are also `call` nodes (def/defp/defmacro/defmacrop)
  methodNodeTypes: ['call'],
  bodyNodeTypes: ['do_block'],

  extractName: extractElixirMethodName,

  extractReturnType(_node: SyntaxNode): string | undefined {
    // Elixir has no return type annotations in standard syntax
    return undefined;
  },

  extractParameters: extractElixirParameters,
  extractVisibility: extractElixirVisibility,

  isStatic(_node: SyntaxNode): boolean {
    return false;
  },

  isAbstract(_node: SyntaxNode, _ownerNode: SyntaxNode): boolean {
    return false;
  },

  isFinal(_node: SyntaxNode): boolean {
    return false;
  },
};
