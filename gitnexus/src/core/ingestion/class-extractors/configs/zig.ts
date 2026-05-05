// gitnexus/src/core/ingestion/class-extractors/configs/zig.ts
// Verified against tree-sitter-zig 0.2.0
//
// Zig has no classes. Struct types are represented as top-level
// assignment_statement nodes whose RHS is a struct_expression.
// The extractor treats the enclosing assignment_statement as a
// "Struct" type declaration; the name comes from the declaration's
// `name` field.

import { SupportedLanguages } from 'gitnexus-shared';
import type { ClassExtractionConfig } from '../../class-types.js';

export const zigClassConfig: ClassExtractionConfig = {
  language: SupportedLanguages.Zig,
  // assignment_statement is the const/var decl node; its expression may be
  // a struct_expression. The generic extractor checks typeDeclarationNodes
  // against the query capture type — the tree-sitter query marks these as
  // @definition.const captures, and we rely on the class-extractor only for
  // struct_expression children. Using an empty list lets the generic extractor
  // skip this language (Zig struct names are captured via @definition.const).
  typeDeclarationNodes: [],
  fileScopeNodeTypes: ['source_file'],
};
