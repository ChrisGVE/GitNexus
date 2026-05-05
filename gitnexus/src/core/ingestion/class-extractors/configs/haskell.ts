// gitnexus/src/core/ingestion/class-extractors/configs/haskell.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { ClassExtractionConfig } from '../../class-types.js';

/**
 * Haskell class extractor config.
 *
 * In Haskell the "class" concept maps to:
 *   - data_type / newtype — algebraic data types
 *   - class              — type classes (like interfaces)
 *   - instance           — type class implementations
 */
export const haskellClassConfig: ClassExtractionConfig = {
  language: SupportedLanguages.Haskell,
  typeDeclarationNodes: ['data_type', 'newtype', 'class', 'instance'],
  ancestorScopeNodeTypes: ['data_type', 'newtype', 'class', 'instance'],
};
