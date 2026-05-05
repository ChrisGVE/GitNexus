// gitnexus/src/core/ingestion/class-extractors/configs/sql.ts
//
// SQL has no classes in the traditional sense. CREATE TABLE statements are
// represented as @definition.class captures in SQL_QUERIES and mapped to
// Class nodes so tables can appear in the graph.

import { SupportedLanguages } from 'gitnexus-shared';
import type { ClassExtractionConfig } from '../../class-types.js';

export const sqlClassConfig: ClassExtractionConfig = {
  language: SupportedLanguages.SQL,
  typeDeclarationNodes: ['create_table_statement'],
  ancestorScopeNodeTypes: [],
};
