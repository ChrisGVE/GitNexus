// gitnexus/src/core/ingestion/method-extractors/configs/erlang.ts
//
// Erlang functions: `name(Pattern1, Pattern2) -> Body.`
// Multiple clauses share the same function name; tree-sitter-erlang groups all
// clauses under a single `function` node whose first `atom` child is the name.
//
// Erlang has no classes, so typeDeclarationNodes and bodyNodeTypes are empty —
// methods (functions) are always file-scoped.

import { SupportedLanguages } from 'gitnexus-shared';
import type { MethodExtractionConfig, ParameterInfo } from '../../method-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

function extractErlangName(node: SyntaxNode): string | undefined {
  // `function` node: first atom child is the function name
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child?.type === 'atom') return child.text;
  }
  return undefined;
}

function extractErlangParameters(node: SyntaxNode): ParameterInfo[] {
  // `function_clause` or first clause of `function` holds the arg list.
  // We report arity by counting patterns in the first clause's argument list.
  const clause = (() => {
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child?.type === 'function_clause') return child;
    }
    return null;
  })();
  if (!clause) return [];

  const argList = clause.childForFieldName('arguments');
  if (!argList) return [];

  const params: ParameterInfo[] = [];
  for (let i = 0; i < argList.namedChildCount; i++) {
    const param = argList.namedChild(i);
    if (!param) continue;
    // Use the pattern text as the parameter name for display purposes.
    const name = param.text.trim().slice(0, 40); // cap length for readability
    params.push({ name, type: null, isOptional: false, isVariadic: false });
  }
  return params;
}

export const erlangMethodConfig: MethodExtractionConfig = {
  language: SupportedLanguages.Erlang,
  // Erlang has no class containers; methods are top-level only.
  typeDeclarationNodes: [],
  methodNodeTypes: ['function'],
  bodyNodeTypes: [],

  extractName: extractErlangName,

  extractReturnType(_node) {
    // Return types come from -spec attributes which are separate AST nodes.
    return undefined;
  },

  extractParameters: extractErlangParameters,

  extractVisibility(_node) {
    // Erlang visibility is determined by -export([]) declarations, not syntax.
    // The export checker handles this; here we default to 'public'.
    return 'public';
  },

  isStatic(_node) {
    // All Erlang functions are module-level; no static/instance distinction.
    return false;
  },

  isAbstract(_node, _ownerNode) {
    return false;
  },

  isFinal(_node) {
    return false;
  },
};
