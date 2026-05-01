import { SupportedLanguages } from 'gitnexus-shared';
import type { MethodExtractionConfig, ParameterInfo } from '../../method-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

export const bashMethodConfig: MethodExtractionConfig = {
  language: SupportedLanguages.Bash,
  typeDeclarationNodes: [],
  methodNodeTypes: ['function_definition'],
  bodyNodeTypes: [],

  extractName(node: SyntaxNode) {
    return node.childForFieldName('name')?.text;
  },

  extractReturnType(_node) {
    return undefined;
  },

  extractParameters(_node): ParameterInfo[] {
    return [];
  },

  extractVisibility(_node) {
    return 'public';
  },

  isStatic(_node) {
    return false;
  },

  isAbstract(_node) {
    return false;
  },

  isFinal(_node) {
    return false;
  },
};
