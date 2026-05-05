/**
 * Zig Language Provider
 *
 * Assembles all Zig-specific ingestion capabilities into a single
 * LanguageProvider, following the Strategy pattern used by the pipeline.
 *
 * Key Zig traits:
 *   - importSemantics: 'named' (@import returns a namespace — `const std = @import("std")`)
 *   - No OO — structs only, no inheritance
 *   - Built-ins use the `@` prefix (e.g. @import, @intCast, @as)
 *   - Entry points: main() is the canonical entry point
 *   - Grammar: tree-sitter-zig 0.2.0 (optionalDependency — native build required)
 */

import { SupportedLanguages } from 'gitnexus-shared';
import { defineLanguage } from '../language-provider.js';
import { typeConfig as zigTypeConfig } from '../type-extractors/zig.js';
import { zigExportChecker } from '../export-detection.js';
import { createImportResolver } from '../import-resolvers/resolver-factory.js';
import { zigImportConfig } from '../import-resolvers/configs/zig.js';
import { ZIG_QUERIES } from '../tree-sitter-queries.js';
import { createFieldExtractor } from '../field-extractors/generic.js';
import { zigFieldConfig } from '../field-extractors/configs/zig.js';
import { createMethodExtractor } from '../method-extractors/generic.js';
import { zigMethodConfig } from '../method-extractors/configs/zig.js';
import { createVariableExtractor } from '../variable-extractors/generic.js';
import { zigVariableConfig } from '../variable-extractors/configs/zig.js';
import { createCallExtractor } from '../call-extractors/generic.js';
import { zigCallConfig } from '../call-extractors/configs/zig.js';
import { createClassExtractor } from '../class-extractors/generic.js';
import { zigClassConfig } from '../class-extractors/configs/zig.js';
import { createHeritageExtractor } from '../heritage-extractors/generic.js';

/** Zig built-in functions (those prefixed with @) and std library functions
 *  that should not be treated as project call targets. */
const BUILT_INS: ReadonlySet<string> = new Set([
  // @import built-in
  'import',
  // Type casting / coercion
  'intCast',
  'floatCast',
  'ptrCast',
  'alignCast',
  'as',
  'bitCast',
  'truncate',
  'intToFloat',
  'floatToInt',
  // Reflection
  'TypeOf',
  'sizeOf',
  'alignOf',
  'offsetOf',
  'bitSizeOf',
  // Compile-time
  'compileError',
  'compileLog',
  'embedFile',
  'hasDecl',
  'hasField',
  'field',
  // Memory / pointer
  'ptrToInt',
  'intToPtr',
  'atomicLoad',
  'atomicStore',
  'atomicRmw',
  'cmpxchgStrong',
  'cmpxchgWeak',
  'memset',
  'memcpy',
  // Error handling
  'errorName',
  'errorReturnTrace',
  'returnAddress',
  // Misc
  'panic',
  'addWithOverflow',
  'subWithOverflow',
  'mulWithOverflow',
  'shlWithOverflow',
  'call',
  'tagName',
  'unionInit',
  'Vector',
  'shuffle',
  'splat',
  'reduce',
  // std.debug / std.log (called as field expressions)
  'print',
  'assert',
  'warn',
  'info',
  'err',
  'debug',
  'log',
]);

export const zigProvider = defineLanguage({
  id: SupportedLanguages.Zig,
  extensions: ['.zig'],
  entryPointPatterns: [/^main$/],
  treeSitterQueries: ZIG_QUERIES,
  typeConfig: zigTypeConfig,
  exportChecker: zigExportChecker,
  importResolver: createImportResolver(zigImportConfig),
  callExtractor: createCallExtractor(zigCallConfig),
  fieldExtractor: createFieldExtractor(zigFieldConfig),
  methodExtractor: createMethodExtractor(zigMethodConfig),
  variableExtractor: createVariableExtractor(zigVariableConfig),
  classExtractor: createClassExtractor(zigClassConfig),
  heritageExtractor: createHeritageExtractor(SupportedLanguages.Zig),
  builtInNames: BUILT_INS,
});
