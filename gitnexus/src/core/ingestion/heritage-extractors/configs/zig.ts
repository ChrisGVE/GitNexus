// gitnexus/src/core/ingestion/heritage-extractors/configs/zig.ts
//
// Zig has no inheritance model — structs cannot extend other structs.
// Zig's type-system composition is done via tagged unions and comptime
// duck-typing, not inheritance chains. No heritage queries are emitted.

import { SupportedLanguages } from 'gitnexus-shared';
import type { HeritageExtractionConfig } from '../../heritage-types.js';

export const zigHeritageConfig: HeritageExtractionConfig = {
  language: SupportedLanguages.Zig,
};
