/**
 * Elixir import resolution config.
 *
 * Elixir uses `alias`, `import`, `use`, and `require` to bring modules into
 * scope. The tree-sitter query captures these with @import.source, extracting
 * the alias node text (e.g. "MyApp.Utils", "GenServer").
 *
 * Resolution converts module names to file paths by:
 *   1. Converting `MyApp.Utils` → `my_app/utils`
 *   2. Looking up the resulting path with `.ex` / `.exs` extensions
 *
 * External OTP libraries (atoms, single-word uppercase aliases like GenServer)
 * that have no matching file are treated as external and ignored.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import type { ImportResolutionConfig, ImportResolverStrategy } from '../types.js';
import { suffixResolve } from '../utils.js';

/**
 * Convert an Elixir module name to a relative file path.
 * e.g. "MyApp.Utils" → ["my_app", "utils"]
 *      "MyApp.HTTP.Client" → ["my_app", "http", "client"]
 */
function moduleNameToParts(moduleName: string): string[] {
  return moduleName
    .split('.')
    .map((part) =>
      // CamelCase → snake_case conversion
      part
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .toLowerCase(),
    )
    .filter(Boolean);
}

/** Elixir module-name → file path resolution strategy. */
const elixirModuleStrategy: ImportResolverStrategy = (rawImportPath, _filePath, ctx) => {
  // Skip atoms and single-word core modules that have no file representation
  if (!rawImportPath.includes('.') && /^[A-Z]/.test(rawImportPath) === false) return null;

  const parts = moduleNameToParts(rawImportPath);
  if (parts.length === 0) return null;

  const resolved = suffixResolve(parts, ctx.normalizedFileList, ctx.allFileList, ctx.index);
  return resolved ? { kind: 'files', files: [resolved] } : null;
};

export const elixirImportConfig: ImportResolutionConfig = {
  language: SupportedLanguages.Elixir,
  strategies: [elixirModuleStrategy],
};
