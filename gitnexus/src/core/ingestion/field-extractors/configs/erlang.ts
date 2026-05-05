// gitnexus/src/core/ingestion/field-extractors/configs/erlang.ts
//
// Erlang record fields: -record(person, {name, age = 0}).
// tree-sitter-erlang surfaces these as `record_field` nodes inside
// `record_attribute`.

import { SupportedLanguages } from 'gitnexus-shared';
import type { FieldExtractionConfig } from '../generic.js';

export const erlangFieldConfig: FieldExtractionConfig = {
  language: SupportedLanguages.Erlang,
  typeDeclarationNodes: ['record_attribute'],
  fieldNodeTypes: ['record_field'],
  bodyNodeTypes: ['record_attribute'],
  defaultVisibility: 'public',

  extractName(node) {
    // record_field: field name is the first atom child
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child?.type === 'atom') return child.text;
    }
    return undefined;
  },

  extractType(_node) {
    // Erlang record fields carry no inline type annotation in source;
    // types are in -spec attributes which are not yet linked here.
    return undefined;
  },

  extractVisibility(_node) {
    // Erlang has no field visibility modifiers; all record fields are public.
    return 'public';
  },

  isStatic(_node) {
    return false;
  },

  isReadonly(_node) {
    return false;
  },
};
