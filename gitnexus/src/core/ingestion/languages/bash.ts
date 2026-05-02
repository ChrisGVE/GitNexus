/**
 * Bash Language Provider
 *
 * Key Bash traits:
 *   - importSemantics: 'wildcard-leaf' (source brings everything into scope)
 *   - No classes or OO constructs
 *   - Functions defined with `function foo() {}` or `foo() {}`
 *   - Variables are untyped (all strings)
 *   - Imports via `source file.sh` or `. file.sh`
 */

import { SupportedLanguages } from 'gitnexus-shared';
import { createClassExtractor } from '../class-extractors/generic.js';
import { bashClassConfig } from '../class-extractors/configs/bash.js';
import { defineLanguage } from '../language-provider.js';
import { typeConfig as bashConfig } from '../type-extractors/bash.js';
import { bashExportChecker } from '../export-detection.js';
import { createImportResolver } from '../import-resolvers/resolver-factory.js';
import { bashImportConfig } from '../import-resolvers/configs/bash.js';
import { BASH_QUERIES } from '../tree-sitter-queries.js';
import { createFieldExtractor } from '../field-extractors/generic.js';
import { bashFieldConfig } from '../field-extractors/configs/bash.js';
import { createMethodExtractor } from '../method-extractors/generic.js';
import { bashMethodConfig } from '../method-extractors/configs/bash.js';
import { createVariableExtractor } from '../variable-extractors/generic.js';
import { bashVariableConfig } from '../variable-extractors/configs/bash.js';
import { createCallExtractor } from '../call-extractors/generic.js';
import { bashCallConfig } from '../call-extractors/configs/bash.js';
import { createHeritageExtractor } from '../heritage-extractors/generic.js';
import { bashHeritageConfig } from '../heritage-extractors/configs/bash.js';

const BUILT_INS: ReadonlySet<string> = new Set([
  'echo',
  'printf',
  'read',
  'cd',
  'pwd',
  'ls',
  'cat',
  'grep',
  'sed',
  'awk',
  'find',
  'xargs',
  'sort',
  'uniq',
  'wc',
  'head',
  'tail',
  'cut',
  'tr',
  'tee',
  'test',
  'true',
  'false',
  'exit',
  'return',
  'export',
  'unset',
  'local',
  'declare',
  'readonly',
  'shift',
  'set',
  'eval',
  'exec',
  'trap',
  'wait',
  'kill',
  'sleep',
  'date',
  'basename',
  'dirname',
  'mktemp',
  'mkdir',
  'rm',
  'cp',
  'mv',
  'chmod',
  'chown',
  'touch',
  'ln',
  'which',
  'command',
  'type',
  'hash',
  'getopts',
  'pushd',
  'popd',
  'dirs',
]);

export const bashProvider = defineLanguage({
  id: SupportedLanguages.Bash,
  extensions: ['.sh', '.bash'],
  entryPointPatterns: [/^main$/],
  astFrameworkPatterns: [],
  treeSitterQueries: BASH_QUERIES,
  typeConfig: bashConfig,
  exportChecker: bashExportChecker,
  importResolver: createImportResolver(bashImportConfig),
  importSemantics: 'wildcard-leaf',
  callExtractor: createCallExtractor(bashCallConfig),
  fieldExtractor: createFieldExtractor(bashFieldConfig),
  methodExtractor: createMethodExtractor(bashMethodConfig),
  variableExtractor: createVariableExtractor(bashVariableConfig),
  classExtractor: createClassExtractor(bashClassConfig),
  heritageExtractor: createHeritageExtractor(bashHeritageConfig),
  builtInNames: BUILT_INS,
});
