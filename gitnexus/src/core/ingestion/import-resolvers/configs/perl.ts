/**
 * Perl import resolution config.
 *
 * Perl resolves `use Module::Name` to a file by converting `::` to `/` and
 * appending `.pm`. For example, `use Scalar::Util` maps to `Scalar/Util.pm`.
 * `require "file.pm"` is resolved directly.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import type { ImportResolutionConfig, ImportResolverStrategy } from '../types.js';
import { suffixResolve } from '../utils.js';

/**
 * Perl module resolution:
 * - `Module::Name` → convert `::` to `/` and resolve as `Module/Name.pm`
 * - `relative/path.pm` → resolve directly
 */
export const perlModuleStrategy: ImportResolverStrategy = (rawImportPath, _filePath, ctx) => {
  // Convert Perl module notation Module::Name → Module/Name
  const filePath = rawImportPath.replace(/::/g, '/');
  // Strip surrounding quotes if present (require "file.pm")
  const cleanPath = filePath.replace(/^['"]|['"]$/g, '');
  const pathParts = cleanPath.replace(/\.pm$/, '').split('/').filter(Boolean);

  const resolved = suffixResolve(pathParts, ctx.normalizedFileList, ctx.allFileList, ctx.index);
  return resolved ? { kind: 'files', files: [resolved] } : null;
};

export const perlImportConfig: ImportResolutionConfig = {
  language: SupportedLanguages.Perl,
  strategies: [perlModuleStrategy],
};
