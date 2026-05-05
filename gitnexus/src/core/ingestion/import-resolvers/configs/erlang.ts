/**
 * Erlang import resolution config.
 *
 * Erlang does not use explicit import statements for cross-module references.
 * Cross-module calls are written as `Module:Function(Args)`, where the module
 * name directly identifies the source file (`module_name.erl`).
 *
 * The -import(Module, [Fun/Arity]) attribute exists but is rare and generally
 * discouraged. When present, the raw import path is the module atom, which we
 * resolve by looking for `<module>.erl` in the file list.
 *
 * importSemantics is 'wildcard-leaf': importing a module brings all its
 * exported functions into scope under the module name.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import type { ImportResolutionConfig, ImportResolverStrategy } from '../types.js';

/**
 * Erlang module-atom import strategy.
 * Resolves a bare module name (atom) to its `.erl` source file.
 */
const erlangModuleStrategy: ImportResolverStrategy = (rawImportPath, _filePath, ctx) => {
  // Strip quotes if any (import capture may include them)
  const moduleName = rawImportPath.replace(/^['"]|['"]$/g, '').trim();
  if (!moduleName) return null;

  const targetFile = `${moduleName}.erl`;
  const matches: string[] = [];
  for (const fp of ctx.allFileList) {
    const basename = fp.split('/').pop() ?? fp;
    if (basename === targetFile) {
      matches.push(fp);
    }
  }

  if (matches.length > 0) return { kind: 'files', files: matches };

  // External OTP application — no local file to resolve to.
  return { kind: 'files', files: [] };
};

export const erlangImportConfig: ImportResolutionConfig = {
  language: SupportedLanguages.Erlang,
  strategies: [erlangModuleStrategy],
};
