/**
 * Elixir language provider.
 *
 * Elixir uses named import semantics: `alias`, `import`, `use`, and `require`
 * bring specific modules into scope. Visibility is determined by `def` (public)
 * vs `defp` (private).
 *
 * Heritage is expressed via `use Module`, which injects callbacks and optional
 * default implementations (analogous to Ruby's `include`). This is handled via
 * callBasedHeritage so the enclosing module name can be resolved from the AST.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import { createClassExtractor } from '../class-extractors/generic.js';
import { elixirClassConfig } from '../class-extractors/configs/elixir.js';
import { defineLanguage } from '../language-provider.js';
import { typeConfig as elixirTypeConfig } from '../type-extractors/elixir.js';
import { elixirExportChecker } from '../export-detection.js';
import { createImportResolver } from '../import-resolvers/resolver-factory.js';
import { elixirImportConfig } from '../import-resolvers/configs/elixir.js';
import { ELIXIR_QUERIES } from '../tree-sitter-queries.js';
import { createFieldExtractor } from '../field-extractors/generic.js';
import { elixirFieldConfig } from '../field-extractors/configs/elixir.js';
import { createMethodExtractor } from '../method-extractors/generic.js';
import { elixirMethodConfig } from '../method-extractors/configs/elixir.js';
import { createVariableExtractor } from '../variable-extractors/generic.js';
import { elixirVariableConfig } from '../variable-extractors/configs/elixir.js';
import { createCallExtractor } from '../call-extractors/generic.js';
import { elixirCallConfig } from '../call-extractors/configs/elixir.js';
import { createHeritageExtractor } from '../heritage-extractors/generic.js';
import { elixirHeritageConfig } from '../heritage-extractors/configs/elixir.js';

const BUILT_INS: ReadonlySet<string> = new Set([
  // IO module
  'puts',
  'inspect',
  // Kernel
  'raise',
  'throw',
  'exit',
  'spawn',
  'send',
  'receive',
  'self',
  'is_nil',
  'is_atom',
  'is_binary',
  'is_integer',
  'is_float',
  'is_list',
  'is_map',
  'is_tuple',
  'is_function',
  'is_pid',
  'is_port',
  'is_reference',
  'is_boolean',
  'is_bitstring',
  'is_number',
  'length',
  'hd',
  'tl',
  'elem',
  'tuple_size',
  'map_size',
  'byte_size',
  'bit_size',
  'abs',
  'div',
  'rem',
  'max',
  'min',
  'not',
  'and',
  'or',
  'trunc',
  'round',
  'floor',
  'ceil',
  'apply',
  'make_ref',
  'node',
  // Enum
  'map',
  'filter',
  'reduce',
  'each',
  'sort',
  'flat_map',
  'any',
  'all',
  'count',
  'find',
  'reject',
  'zip',
  'uniq',
  'group_by',
  'into',
  'member',
  'sum',
  'min_by',
  'max_by',
  'take',
  'drop',
  'reverse',
  'to_list',
  // List
  'first',
  'last',
  'flatten',
  'concat',
  'delete',
  'duplicate',
  'wrap',
  // Map
  'get',
  'put',
  'merge',
  'keys',
  'values',
  'delete',
  'update',
  'fetch',
  'has_key',
  'new',
  // String
  'trim',
  'split',
  'upcase',
  'downcase',
  'contains',
  'starts_with',
  'ends_with',
  'replace',
  'slice',
  'to_integer',
  'to_float',
  'to_atom',
  'to_charlist',
  // Logger
  'debug',
  'info',
  'warn',
  'error',
]);

export const elixirProvider = defineLanguage({
  id: SupportedLanguages.Elixir,
  extensions: ['.ex', '.exs'],
  entryPointPatterns: [/^main$/],
  treeSitterQueries: ELIXIR_QUERIES,
  typeConfig: elixirTypeConfig,
  exportChecker: elixirExportChecker,
  importResolver: createImportResolver(elixirImportConfig),
  importSemantics: 'named',
  callExtractor: createCallExtractor(elixirCallConfig),
  fieldExtractor: createFieldExtractor(elixirFieldConfig),
  methodExtractor: createMethodExtractor(elixirMethodConfig),
  variableExtractor: createVariableExtractor(elixirVariableConfig),
  classExtractor: createClassExtractor(elixirClassConfig),
  heritageExtractor: createHeritageExtractor(elixirHeritageConfig),
  builtInNames: BUILT_INS,
});
