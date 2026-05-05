// gitnexus/src/core/ingestion/method-extractors/configs/perl.ts
// Verified against tree-sitter-perl 1.0.0 (node-types.json)

import { SupportedLanguages } from 'gitnexus-shared';
import type { MethodExtractionConfig, ParameterInfo } from '../../method-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

/**
 * Extract parameters from a Perl subroutine signature.
 *
 * Perl subroutines receive arguments via @_. Modern Perl uses
 * `my ($self, $arg1, $arg2) = @_;` in the body. Since tree-sitter-perl
 * does not expose a formal parameter list node (arguments come from @_
 * in the body), we return an empty list and rely on body-level analysis.
 */
function extractPerlParameters(_node: SyntaxNode): ParameterInfo[] {
  return [];
}

export const perlMethodConfig: MethodExtractionConfig = {
  language: SupportedLanguages.Perl,
  // Perl uses package_statement as the class-level container
  typeDeclarationNodes: ['package_statement'],
  // subroutine_declaration_statement covers: sub name { ... }
  methodNodeTypes: ['subroutine_declaration_statement'],
  bodyNodeTypes: ['block'],

  extractName(node) {
    const nameNode = node.childForFieldName('name');
    return nameNode?.text;
  },

  extractReturnType(_node) {
    // Perl has no static return type annotations
    return undefined;
  },

  extractParameters: extractPerlParameters,

  extractVisibility(_node) {
    // Perl has no formal access control; all subs are effectively public
    return 'public';
  },

  isStatic(_node) {
    // Perl does not distinguish instance vs. static at the declaration level
    return false;
  },

  isAbstract(_node, _ownerNode) {
    return false;
  },

  isFinal(_node) {
    return false;
  },
};
