/**
 * Zig import resolution config.
 *
 * Zig uses `@import("path")` for all imports. The path is a string literal:
 *   - Relative file paths:  @import("math.zig"), @import("./utils.zig")
 *   - Standard library:     @import("std")      (no file extension)
 *   - Builtin root:         @import("builtin")
 *   - Build-system root:    @import("build_options")
 *
 * Resolution strategy:
 *   1. Skip standard library and built-in package imports (no .zig extension
 *      and no explicit relative prefix — these resolve to std/builtin, not
 *      project files).
 *   2. Strip surrounding quotes from the captured string literal.
 *   3. Resolve the remaining path relative to the importing file.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import type { ImportResolutionConfig, ImportResolverStrategy } from '../types.js';
import { resolveStandard } from '../standard.js';

/** Well-known Zig standard / built-in import names that have no project file. */
const ZIG_BUILTIN_IMPORTS = new Set(['std', 'builtin', 'build_options', 'root']);

/**
 * Zig @import("...") resolution strategy.
 *
 * The tree-sitter query captures the string_literal node's text including
 * surrounding quotes (e.g. `"math.zig"`). We strip the quotes before resolving.
 */
export const zigImportStrategy: ImportResolverStrategy = (rawImportPath, filePath, ctx) => {
  // Strip surrounding quotes from the string literal capture
  const stripped = rawImportPath.replace(/^["']|["']$/g, '');

  // Skip standard library and built-in packages
  if (ZIG_BUILTIN_IMPORTS.has(stripped)) return { kind: 'files', files: [] };

  // Resolve as a relative path. Zig imports without a leading './' are still
  // relative to the current file directory in the project tree, so prepend './'.
  const relPath = stripped.startsWith('.') ? stripped : './' + stripped;
  return resolveStandard(relPath, filePath, ctx, SupportedLanguages.Zig);
};

export const zigImportConfig: ImportResolutionConfig = {
  language: SupportedLanguages.Zig,
  strategies: [zigImportStrategy],
};
