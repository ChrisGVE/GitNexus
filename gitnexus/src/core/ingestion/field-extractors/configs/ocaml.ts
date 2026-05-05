// gitnexus/src/core/ingestion/field-extractors/configs/ocaml.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { FieldExtractionConfig } from '../generic.js';
import { extractSimpleTypeName } from '../../type-extractors/shared.js';

/**
 * OCaml field extraction config.
 *
 * OCaml record fields appear as field_declaration nodes inside record_declaration.
 * All fields in .ml files are public unless the .mli interface omits them,
 * but at the syntactic level we treat all as public.
 */
export const ocamlFieldConfig: FieldExtractionConfig = {
  language: SupportedLanguages.OCaml,
  typeDeclarationNodes: ['type_definition'],
  fieldNodeTypes: ['field_declaration'],
  bodyNodeTypes: ['record_declaration'],
  defaultVisibility: 'public',

  extractName(node) {
    // field_declaration has a field_name child
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child?.type === 'field_name') return child.text;
    }
    return undefined;
  },

  extractType(node) {
    // field_declaration: field_name ":" type
    // The type node is typically the last named child after the colon
    let sawFieldName = false;
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (!child) continue;
      if (child.type === 'field_name') {
        sawFieldName = true;
        continue;
      }
      if (sawFieldName) {
        return extractSimpleTypeName(child) ?? child.text?.trim();
      }
    }
    return undefined;
  },

  extractVisibility(_node) {
    // All OCaml record fields are public at the syntactic level
    return 'public';
  },

  isStatic(_node) {
    return false;
  },

  isReadonly(_node) {
    // OCaml record fields are immutable by default (mutable keyword makes them mutable)
    return true;
  },
};
