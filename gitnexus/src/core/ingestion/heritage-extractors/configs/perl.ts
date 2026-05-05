// gitnexus/src/core/ingestion/heritage-extractors/configs/perl.ts
//
// Perl inheritance is expressed via:
//   use parent 'Base';
//   use base 'Base';
//   our @ISA = ('Base');
//
// The use_statement with module "parent" or "base" carries the parent class
// name in the quoted word list argument. @ISA assignment is handled as a
// plain call-based check; we focus on the `use parent`/`use base` pattern
// which covers the vast majority of modern Perl OO code.

import { SupportedLanguages } from 'gitnexus-shared';
import type { HeritageExtractionConfig } from '../../heritage-types.js';

export const perlHeritageConfig: HeritageExtractionConfig = {
  language: SupportedLanguages.Perl,
  // No call-based heritage — `use parent` is parsed as a use_statement,
  // not a function call. The heritage is captured via query captures when
  // tree-sitter-perl is available; when it is not, files are skipped.
};
