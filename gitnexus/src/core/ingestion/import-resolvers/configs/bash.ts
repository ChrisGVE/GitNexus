/**
 * Bash import resolution config.
 * Bash uses `source file.sh` or `. file.sh` to include other scripts.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import type { ImportResolutionConfig, ImportResolverStrategy } from '../types.js';
import { suffixResolve } from '../utils.js';

export const bashSourceStrategy: ImportResolverStrategy = (rawImportPath, _filePath, ctx) => {
  const cleanPath = rawImportPath.replace(/^['"]|['"]$/g, '').replace(/^\$\{.*\}\/?/, '');
  if (!cleanPath) return null;
  const pathParts = cleanPath.split('/').filter(Boolean);
  const resolved = suffixResolve(pathParts, ctx.normalizedFileList, ctx.allFileList, ctx.index);
  return resolved ? { kind: 'files', files: [resolved] } : null;
};

export const bashImportConfig: ImportResolutionConfig = {
  language: SupportedLanguages.Bash,
  strategies: [bashSourceStrategy],
};
