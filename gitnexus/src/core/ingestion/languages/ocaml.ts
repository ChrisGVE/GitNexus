/**
 * OCaml Language Provider
 *
 * Assembles all OCaml-specific ingestion capabilities into a single
 * LanguageProvider, following the Strategy pattern used by the pipeline.
 *
 * Key OCaml traits:
 *   - importSemantics: 'named' (open Module brings members into scope)
 *   - mroStrategy: not applicable (OCaml has no class inheritance hierarchy)
 *   - all top-level let-bindings are public unless hidden by .mli interface
 *   - modules are the primary organisational unit (mapped to Class nodes)
 */

import { SupportedLanguages } from 'gitnexus-shared';
import { createClassExtractor } from '../class-extractors/generic.js';
import { ocamlClassConfig } from '../class-extractors/configs/ocaml.js';
import { defineLanguage } from '../language-provider.js';
import { typeConfig as ocamlTypeConfig } from '../type-extractors/ocaml.js';
import { ocamlExportChecker } from '../export-detection.js';
import { createImportResolver } from '../import-resolvers/resolver-factory.js';
import { ocamlImportConfig } from '../import-resolvers/configs/ocaml.js';
import { OCAML_QUERIES } from '../tree-sitter-queries.js';
import { createFieldExtractor } from '../field-extractors/generic.js';
import { ocamlFieldConfig } from '../field-extractors/configs/ocaml.js';
import { createMethodExtractor } from '../method-extractors/generic.js';
import { ocamlMethodConfig } from '../method-extractors/configs/ocaml.js';
import { createVariableExtractor } from '../variable-extractors/generic.js';
import { ocamlVariableConfig } from '../variable-extractors/configs/ocaml.js';
import { createCallExtractor } from '../call-extractors/generic.js';
import { ocamlCallConfig } from '../call-extractors/configs/ocaml.js';
import { createHeritageExtractor } from '../heritage-extractors/generic.js';

/**
 * OCaml standard library names that are unambiguously built-in and are
 * unlikely to collide with user-defined functions. Generic names (add, map,
 * iter, filter, find, create, get, set, etc.) are intentionally excluded
 * because they are common in user code and would produce false negatives.
 */
const BUILT_INS: ReadonlySet<string> = new Set([
  // I/O
  'print_string',
  'print_int',
  'print_float',
  'print_char',
  'print_bool',
  'print_endline',
  'print_newline',
  'printf',
  'sprintf',
  'fprintf',
  'eprintf',
  'read_line',
  'read_int',
  'read_float',
  'flush',
  // Type conversions (long names, low collision risk)
  'int_of_string',
  'string_of_int',
  'float_of_string',
  'string_of_float',
  'int_of_float',
  'float_of_int',
  'char_of_int',
  'int_of_char',
  // Error handling
  'failwith',
  'invalid_arg',
  'raise',
  // Utilities
  'ignore',
  'ref',
  'not',
  'fst',
  'snd',
  'succ',
  'pred',
  'abs',
  'exit',
  // Constructors (unambiguous option/result variant names)
  'Some',
  'None',
  'Ok',
  'Error',
]);

export const ocamlProvider = defineLanguage({
  id: SupportedLanguages.OCaml,
  extensions: ['.ml', '.mli'],
  entryPointPatterns: [/^main$/],
  treeSitterQueries: OCAML_QUERIES,
  typeConfig: ocamlTypeConfig,
  exportChecker: ocamlExportChecker,
  importResolver: createImportResolver(ocamlImportConfig),
  importSemantics: 'named',
  callExtractor: createCallExtractor(ocamlCallConfig),
  fieldExtractor: createFieldExtractor(ocamlFieldConfig),
  methodExtractor: createMethodExtractor(ocamlMethodConfig),
  variableExtractor: createVariableExtractor(ocamlVariableConfig),
  classExtractor: createClassExtractor(ocamlClassConfig),
  heritageExtractor: createHeritageExtractor(SupportedLanguages.OCaml),
  builtInNames: BUILT_INS,
});
