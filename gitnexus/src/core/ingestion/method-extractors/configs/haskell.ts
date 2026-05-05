// gitnexus/src/core/ingestion/method-extractors/configs/haskell.ts
// Verified against tree-sitter-haskell ^0.23.1

import { SupportedLanguages } from 'gitnexus-shared';
import type { MethodExtractionConfig, ParameterInfo } from '../../method-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

/**
 * Haskell method extraction config.
 *
 * In Haskell, "methods" are the signatures and definitions inside type class
 * declarations and their instances.  The grammar uses:
 *   - class_declarations: contains `signature` nodes for type class method sigs
 *   - instance_declarations: contains `function` / `bind` nodes for implementations
 *
 * A `signature` node in class_declarations:
 *   signature → variable @name, function (type)
 *
 * A `function` node in instance_declarations:
 *   function → variable @name, patterns, match
 *
 * Parameters are not statically typed in the declaration in the traditional
 * OO sense — Haskell methods are defined by their type signatures.
 * We extract the variable name as the method name and leave parameters empty
 * since tree-sitter captures patterns (not parameter declarations with types).
 */

function extractHaskellMethodName(node: SyntaxNode): string | undefined {
  // signature node: first named child is `variable`
  // function node: first named child is `variable`
  const first = node.namedChild(0);
  if (first?.type === 'variable') return first.text;
  return undefined;
}

function extractHaskellReturnType(node: SyntaxNode): string | undefined {
  // signature node has a `function` child representing the type
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child?.type === 'function' || child?.type === 'name' || child?.type === 'apply') {
      return child.text?.trim();
    }
  }
  return undefined;
}

function extractHaskellParameters(_node: SyntaxNode): ParameterInfo[] {
  // Haskell pattern matching is in the method body, not the signature.
  // Parameter info is not available from the declaration alone.
  return [];
}

export const haskellMethodConfig: MethodExtractionConfig = {
  language: SupportedLanguages.Haskell,
  typeDeclarationNodes: ['class', 'instance'],
  methodNodeTypes: ['signature', 'function', 'bind'],
  bodyNodeTypes: ['class_declarations', 'instance_declarations'],

  extractName: extractHaskellMethodName,
  extractReturnType: extractHaskellReturnType,
  extractParameters: extractHaskellParameters,

  extractVisibility(_node: SyntaxNode) {
    // Haskell type class methods are all public (export list controls visibility)
    return 'public';
  },

  isStatic(_node: SyntaxNode) {
    return false;
  },

  isAbstract(node: SyntaxNode, ownerNode: SyntaxNode) {
    // A method is abstract when it appears as a `signature` in a `class` body
    // (not in an `instance` body — instances always provide concrete definitions)
    return node.type === 'signature' && ownerNode.type === 'class';
  },

  isFinal(_node: SyntaxNode) {
    return false;
  },
};
