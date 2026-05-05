// gitnexus/src/core/ingestion/variable-extractors/configs/perl.ts
//
// Perl variable declarations use `my`, `our`, or `local` keywords.
// tree-sitter-perl represents them as `variable_declaration` nodes with
// a `variable` field (scalar/array/hash) or `variables` (list form).

import { SupportedLanguages } from 'gitnexus-shared';
import type { VariableExtractionConfig, VariableVisibility } from '../../variable-types.js';

export const perlVariableConfig: VariableExtractionConfig = {
  language: SupportedLanguages.Perl,
  constNodeTypes: [],
  staticNodeTypes: [],
  variableNodeTypes: ['variable_declaration'],

  extractName(node) {
    // variable_declaration has a `variable` field (single) or `variables` (list).
    // The variable node is a scalar ($var), array (@arr), or hash (%hash) node.
    // tree-sitter-perl: scalar/array/hash nodes contain a varname child.
    const varNode = node.childForFieldName('variable');
    if (varNode) return varNode.text;
    // List form: my ($a, $b) — return first variable name
    const variablesNode = node.childForFieldName('variables');
    if (variablesNode) {
      for (let i = 0; i < variablesNode.namedChildCount; i++) {
        const child = variablesNode.namedChild(i);
        if (child && child.text) return child.text;
      }
    }
    return undefined;
  },

  extractType(_node) {
    // Perl is dynamically typed — no type annotations
    return undefined;
  },

  extractVisibility(node): VariableVisibility {
    // `our` declarations have package (global) scope — treat as public
    // `my` and `local` are lexically scoped — treat as private
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child?.type === 'our') return 'public';
    }
    return 'private';
  },

  isConst(_node) {
    return false; // Perl has no native const (use constant pragma is a separate construct)
  },

  isStatic(_node) {
    return false;
  },

  isMutable(_node) {
    return true;
  },
};
