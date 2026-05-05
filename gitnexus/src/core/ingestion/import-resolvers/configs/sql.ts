// gitnexus/src/core/ingestion/import-resolvers/configs/sql.ts
//
// SQL has no import system — all objects exist in the database namespace.
// No import strategies are registered; every call to the resolver returns null.

import { SupportedLanguages } from 'gitnexus-shared';
import type { ImportResolutionConfig } from '../types.js';

export const sqlImportConfig: ImportResolutionConfig = {
  language: SupportedLanguages.SQL,
  strategies: [],
};
