// gitnexus/src/core/ingestion/call-extractors/configs/sql.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { CallExtractionConfig } from '../../call-types.js';

export const sqlCallConfig: CallExtractionConfig = {
  language: SupportedLanguages.SQL,
};
