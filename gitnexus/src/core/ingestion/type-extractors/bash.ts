import type { SyntaxNode } from '../utils/ast-helpers.js';
import type { LanguageTypeConfig, ParameterExtractor, TypeBindingExtractor } from './types.js';

const extractDeclaration: TypeBindingExtractor = (
  _node: SyntaxNode,
  _env: Map<string, string>,
): void => {};

const extractParameter: ParameterExtractor = (
  _node: SyntaxNode,
  _env: Map<string, string>,
): void => {};

export const typeConfig: LanguageTypeConfig = {
  declarationNodeTypes: new Set(['variable_assignment']),
  extractDeclaration,
  extractParameter,
};
