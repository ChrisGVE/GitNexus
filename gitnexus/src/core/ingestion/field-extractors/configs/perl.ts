// gitnexus/src/core/ingestion/field-extractors/configs/perl.ts
//
// Perl has no formal field/property declarations. Instance data is stored
// in the blessed hash (e.g., $self->{field} = value). We do not attempt
// to extract fields as there is no declaration syntax to parse.

import { SupportedLanguages } from 'gitnexus-shared';
import type { FieldExtractionConfig } from '../generic.js';

export const perlFieldConfig: FieldExtractionConfig = {
  language: SupportedLanguages.Perl,
  typeDeclarationNodes: ['package_statement'],
  fieldNodeTypes: [],
  bodyNodeTypes: ['block'],
  defaultVisibility: 'public',

  extractName(_node) {
    return undefined;
  },

  extractType(_node) {
    return undefined;
  },

  extractVisibility(_node) {
    return 'public';
  },

  isStatic(_node) {
    return false;
  },

  isReadonly(_node) {
    return false;
  },
};
