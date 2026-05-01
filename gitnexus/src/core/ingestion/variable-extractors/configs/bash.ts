import { SupportedLanguages } from 'gitnexus-shared';
import type { VariableExtractionConfig, VariableVisibility } from '../../variable-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

export const bashVariableConfig: VariableExtractionConfig = {
  language: SupportedLanguages.Bash,
  constNodeTypes: [],
  staticNodeTypes: [],
  variableNodeTypes: ['variable_assignment'],

  extractName(node: SyntaxNode) {
    return node.childForFieldName('name')?.text;
  },

  extractType(_node) {
    return undefined;
  },

  extractVisibility(_node): VariableVisibility {
    return 'public';
  },

  isConst(_node) {
    return false;
  },

  isStatic(_node) {
    return false;
  },

  isMutable(_node) {
    return true;
  },
};
