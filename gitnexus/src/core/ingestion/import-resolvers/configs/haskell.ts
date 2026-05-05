/**
 * Haskell import resolution config.
 *
 * Haskell imports look like:
 *   import Data.Map.Strict (fromList)
 *   import qualified Data.Map as Map
 *   import Math                          -- local module
 *
 * The `import` node in the tree-sitter grammar has a `module` child whose
 * full text is the dotted module name (e.g. "Data.Map.Strict").  The raw
 * capture text from HASKELL_QUERIES is this dotted name.
 *
 * Resolution strategy:
 *   1. Convert dots to slashes: "Math" → "Math", "Utils.Parser" → "Utils/Parser"
 *   2. Try suffix-based resolution with .hs / .lhs extensions
 *   3. External/prelude modules (e.g. "Data.Map", "System.IO") produce no result
 */

import { SupportedLanguages } from 'gitnexus-shared';
import type { ImportResolutionConfig, ImportResolverStrategy } from '../types.js';
import { suffixResolve } from '../utils.js';

/**
 * Convert a Haskell dotted module name to slash-separated path parts.
 * "Utils.Parser" → ["Utils", "Parser"]
 */
function moduleNameToParts(moduleName: string): string[] {
  return moduleName.trim().split('.').filter(Boolean);
}

/** Haskell module-name-to-file resolution strategy. */
export const haskellModuleStrategy: ImportResolverStrategy = (rawImportPath, _filePath, ctx) => {
  const parts = moduleNameToParts(rawImportPath);
  if (parts.length === 0) return null;

  const resolved = suffixResolve(parts, ctx.normalizedFileList, ctx.allFileList, ctx.index);
  return resolved ? { kind: 'files', files: [resolved] } : null;
};

export const haskellImportConfig: ImportResolutionConfig = {
  language: SupportedLanguages.Haskell,
  strategies: [haskellModuleStrategy],
};
