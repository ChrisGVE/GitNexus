/**
 * OCaml import resolution config.
 *
 * OCaml uses `open Module` statements to bring module members into scope.
 * The module name maps to a file: `open Math` → `math.ml` or `Math.ml`
 * (OCaml capitalises module names but lowercases filenames).
 * Standard fallback handles the filename lookup.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import type { ImportResolutionConfig, ImportResolverStrategy } from '../types.js';
import { createStandardStrategy } from '../standard.js';

/**
 * OCaml module resolution strategy.
 * `open Foo` or `open Foo.Bar` → tries lowercase `foo.ml` and `foo/bar.ml`
 * before the standard suffix-matching fallback.
 */
const ocamlModuleStrategy: ImportResolverStrategy = (rawImportPath, filePath, ctx) => {
  // Convert CamelCase module path to lowercase file path segments
  // e.g. "Foo.Bar" → "foo/bar"
  const segments = rawImportPath.split('.').map((s) => s.toLowerCase());
  const lowercasePath = segments.join('/');

  // Try resolving the lowercased path via standard strategy
  const standard = createStandardStrategy(SupportedLanguages.OCaml);
  const result = standard(lowercasePath, filePath, ctx);
  if (result) return result;

  return null;
};

export const ocamlImportConfig: ImportResolutionConfig = {
  language: SupportedLanguages.OCaml,
  strategies: [ocamlModuleStrategy, createStandardStrategy(SupportedLanguages.OCaml)],
};
