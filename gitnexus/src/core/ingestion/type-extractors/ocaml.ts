import type { SyntaxNode } from '../utils/ast-helpers.js';
import type { LanguageTypeConfig, TypeBindingExtractor, ParameterExtractor } from './types.js';
import { extractVarName } from './shared.js';

/**
 * OCaml type extractor.
 *
 * OCaml is a functional language with an ML-style type system. Most type
 * information is inferred. This extractor handles the common patterns:
 *   - let x : T = ...   (explicit type annotation in let_binding)
 *   - fun (x : T) -> ... (parameter with explicit type annotation in parameter node)
 *
 * OCaml uses `value_definition > let_binding` for top-level bindings and
 * `fun_expression / function_expression` for anonymous functions. We focus
 * on the cases where explicit type annotations are present.
 */

const DECLARATION_NODE_TYPES: ReadonlySet<string> = new Set(['let_binding']);

/** OCaml: let x : T = ... → extract explicit type annotation from let_binding */
const extractDeclaration: TypeBindingExtractor = (
  node: SyntaxNode,
  env: Map<string, string>,
): void => {
  if (node.type !== 'let_binding') return;

  const pattern = node.childForFieldName('pattern');
  const typeNode = node.childForFieldName('type');
  if (!pattern || !typeNode) return;

  const varName = extractVarName(pattern);
  const typeName = typeNode.text?.trim();
  if (varName && typeName) env.set(varName, typeName);
};

/** OCaml: fun (x : T) -> ... → parameter with type annotation */
const extractParameter: ParameterExtractor = (node: SyntaxNode, env: Map<string, string>): void => {
  // OCaml parameter nodes can be `(name : type)` (typed_pattern) or plain identifiers
  if (node.type !== 'parameter') return;

  // Look for a typed_pattern child: (identifier : type)
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child?.type === 'typed_pattern') {
      const inner = child.firstNamedChild;
      const typeChild = child.lastNamedChild;
      if (!inner || !typeChild || inner === typeChild) continue;
      const varName = extractVarName(inner);
      const typeName = typeChild.text?.trim();
      if (varName && typeName) env.set(varName, typeName);
    }
  }
};

export const typeConfig: LanguageTypeConfig = {
  declarationNodeTypes: DECLARATION_NODE_TYPES,
  extractDeclaration,
  extractParameter,
};
