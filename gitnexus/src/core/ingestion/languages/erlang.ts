/**
 * Erlang Language Provider
 *
 * Erlang traits:
 *   - importSemantics: 'wildcard-leaf'
 *     Cross-module references use Module:Function(Args) syntax; there is no
 *     import declaration that selects individual symbols.  The optional
 *     -import(Module, [Fun/Arity]) attribute is rare and modelled as a
 *     whole-module single-hop import.
 *   - exportChecker: functions listed in -export([]) are public.
 *   - No class hierarchy: records (-record) are the only named structured type.
 *   - Behaviours (-behaviour/-behavior) are the closest analog to interfaces.
 *
 * Grammar availability:
 *   The `tree-sitter-erlang` npm package (0.0.1-security) is a security
 *   placeholder.  To enable parsing, vendor the real grammar from
 *   https://github.com/WhatsApp/tree-sitter-erlang under
 *   `gitnexus/vendor/tree-sitter-erlang` and update package.json accordingly.
 *   Until then the parser-loader marks this grammar as optional so `.erl`/`.hrl`
 *   files are silently skipped rather than crashing the pipeline.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import { defineLanguage } from '../language-provider.js';
import { typeConfig as erlangTypeConfig } from '../type-extractors/erlang.js';
import { erlangExportChecker } from '../export-detection.js';
import { createImportResolver } from '../import-resolvers/resolver-factory.js';
import { erlangImportConfig } from '../import-resolvers/configs/erlang.js';
import { ERLANG_QUERIES } from '../tree-sitter-queries.js';
import { createCallExtractor } from '../call-extractors/generic.js';
import { erlangCallConfig } from '../call-extractors/configs/erlang.js';
import { createFieldExtractor } from '../field-extractors/generic.js';
import { erlangFieldConfig } from '../field-extractors/configs/erlang.js';
import { createMethodExtractor } from '../method-extractors/generic.js';
import { erlangMethodConfig } from '../method-extractors/configs/erlang.js';
import { createVariableExtractor } from '../variable-extractors/generic.js';
import { erlangVariableConfig } from '../variable-extractors/configs/erlang.js';
import { createClassExtractor } from '../class-extractors/generic.js';
import { erlangClassConfig } from '../class-extractors/configs/erlang.js';
import { createHeritageExtractor } from '../heritage-extractors/generic.js';

/**
 * OTP and stdlib built-ins that should be filtered from the call graph.
 * Includes io:format (canonical Erlang printf), list operations, process
 * primitives, and common gen_server callbacks.
 */
const BUILT_INS: ReadonlySet<string> = new Set([
  // io module
  'format',
  // lists module
  'map',
  'filter',
  'foldl',
  'foldr',
  'foreach',
  'member',
  'reverse',
  'append',
  'flatten',
  'sort',
  'nth',
  'last',
  'keyfind',
  'keystore',
  'keyreplace',
  // erlang BIFs
  'self',
  'spawn',
  'spawn_link',
  'send',
  'receive',
  'exit',
  'error',
  'throw',
  'halt',
  'is_atom',
  'is_integer',
  'is_float',
  'is_list',
  'is_tuple',
  'is_binary',
  'is_pid',
  'is_function',
  'length',
  'hd',
  'tl',
  'abs',
  'atom_to_list',
  'integer_to_list',
  'list_to_atom',
  'list_to_integer',
  'tuple_to_list',
  'list_to_tuple',
  // gen_server callbacks
  'call',
  'cast',
  'reply',
  'start_link',
  'init',
  'handle_call',
  'handle_cast',
  'handle_info',
  'terminate',
  'code_change',
]);

export const erlangProvider = defineLanguage({
  id: SupportedLanguages.Erlang,
  extensions: ['.erl', '.hrl'],
  entryPointPatterns: [/^main$/, /^start$/, /^start_link$/],
  astFrameworkPatterns: [],
  treeSitterQueries: ERLANG_QUERIES,
  typeConfig: erlangTypeConfig,
  exportChecker: erlangExportChecker,
  importResolver: createImportResolver(erlangImportConfig),
  importSemantics: 'wildcard-leaf',
  callExtractor: createCallExtractor(erlangCallConfig),
  fieldExtractor: createFieldExtractor(erlangFieldConfig),
  methodExtractor: createMethodExtractor(erlangMethodConfig),
  variableExtractor: createVariableExtractor(erlangVariableConfig),
  classExtractor: createClassExtractor(erlangClassConfig),
  heritageExtractor: createHeritageExtractor(SupportedLanguages.Erlang),
  builtInNames: BUILT_INS,
});
