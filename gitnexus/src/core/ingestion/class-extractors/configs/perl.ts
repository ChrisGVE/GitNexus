// gitnexus/src/core/ingestion/class-extractors/configs/perl.ts
//
// Perl OO uses packages as the unit of encapsulation. A package declaration
// (`package Name;`) acts as a class when objects are blessed into it.

import { SupportedLanguages } from 'gitnexus-shared';
import type { ClassExtractionConfig } from '../../class-types.js';

export const perlClassConfig: ClassExtractionConfig = {
  language: SupportedLanguages.Perl,
  // package_statement is the Perl equivalent of a class declaration
  typeDeclarationNodes: ['package_statement'],
  // Subroutines can be nested within the package scope
  ancestorScopeNodeTypes: ['package_statement'],
};
