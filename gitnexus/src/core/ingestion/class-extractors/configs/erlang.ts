// gitnexus/src/core/ingestion/class-extractors/configs/erlang.ts
//
// Erlang has no class hierarchy. The closest structural unit is a record
// definition, surfaced in tree-sitter-erlang as `record_attribute`. We map
// records to `Class` nodes so they appear in the graph as typed containers.

import { SupportedLanguages } from 'gitnexus-shared';
import type { ClassExtractionConfig } from '../../class-types.js';

export const erlangClassConfig: ClassExtractionConfig = {
  language: SupportedLanguages.Erlang,
  typeDeclarationNodes: ['record_attribute'],
  ancestorScopeNodeTypes: ['record_attribute'],
};
