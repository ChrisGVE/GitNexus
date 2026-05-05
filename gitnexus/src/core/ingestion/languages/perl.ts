/**
 * Perl language provider.
 *
 * Perl uses `use`/`require` for imports (named import semantics — specific
 * functions/symbols are imported into the caller's namespace via Exporter).
 * OO uses packages and `bless`. Inheritance is declared via
 * `use parent 'Base'` or `use base 'Base'`.
 *
 * NOTE: tree-sitter-perl ^1.0.0 requires tree-sitter ^0.22.0, which is
 * ABI-incompatible with the tree-sitter ^0.21.1 runtime used by this project.
 * The grammar is registered as an optionalDependency; when loading fails,
 * Perl files are silently skipped by the pipeline.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import { createClassExtractor } from '../class-extractors/generic.js';
import { perlClassConfig } from '../class-extractors/configs/perl.js';
import { defineLanguage } from '../language-provider.js';
import { typeConfig as perlTypeConfig } from '../type-extractors/perl.js';
import { perlExportChecker } from '../export-detection.js';
import { createImportResolver } from '../import-resolvers/resolver-factory.js';
import { perlImportConfig } from '../import-resolvers/configs/perl.js';
import { PERL_QUERIES } from '../tree-sitter-queries.js';
import { createFieldExtractor } from '../field-extractors/generic.js';
import { perlFieldConfig } from '../field-extractors/configs/perl.js';
import { createMethodExtractor } from '../method-extractors/generic.js';
import { perlMethodConfig } from '../method-extractors/configs/perl.js';
import { createVariableExtractor } from '../variable-extractors/generic.js';
import { perlVariableConfig } from '../variable-extractors/configs/perl.js';
import { createCallExtractor } from '../call-extractors/generic.js';
import { perlCallConfig } from '../call-extractors/configs/perl.js';
import { createHeritageExtractor } from '../heritage-extractors/generic.js';
import { perlHeritageConfig } from '../heritage-extractors/configs/perl.js';

const BUILT_INS: ReadonlySet<string> = new Set([
  'print',
  'say',
  'die',
  'warn',
  'chomp',
  'chop',
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  'map',
  'grep',
  'join',
  'split',
  'length',
  'substr',
  'index',
  'rindex',
  'uc',
  'lc',
  'ucfirst',
  'lcfirst',
  'open',
  'close',
  'read',
  'write',
  'seek',
  'tell',
  'eof',
  'defined',
  'exists',
  'delete',
  'ref',
  'bless',
  'caller',
  'eval',
  'exit',
  'system',
  'exec',
  'sprintf',
  'printf',
  'wantarray',
  'scalar',
  'keys',
  'values',
  'each',
  'tied',
  'tie',
  'untie',
  'use',
  'require',
  'import',
  'DESTROY',
  'BEGIN',
  'END',
  'AUTOLOAD',
]);

export const perlProvider = defineLanguage({
  id: SupportedLanguages.Perl,
  extensions: ['.pl', '.pm', '.t'],
  entryPointPatterns: [/^main$/],
  astFrameworkPatterns: [],
  treeSitterQueries: PERL_QUERIES,
  typeConfig: perlTypeConfig,
  exportChecker: perlExportChecker,
  importResolver: createImportResolver(perlImportConfig),
  importSemantics: 'named',
  callExtractor: createCallExtractor(perlCallConfig),
  fieldExtractor: createFieldExtractor(perlFieldConfig),
  methodExtractor: createMethodExtractor(perlMethodConfig),
  variableExtractor: createVariableExtractor(perlVariableConfig),
  classExtractor: createClassExtractor(perlClassConfig),
  heritageExtractor: createHeritageExtractor(perlHeritageConfig),
  builtInNames: BUILT_INS,
});
