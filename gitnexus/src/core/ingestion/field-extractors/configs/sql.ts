// gitnexus/src/core/ingestion/field-extractors/configs/sql.ts
//
// Maps CREATE TABLE column definitions to Property nodes.
// In tree-sitter-sql@0.1.0 the grammar node types are:
//   create_table_statement → create_table_parameters → create_table_column_parameter
//   create_table_column_parameter has identifier and type children.

import { SupportedLanguages } from 'gitnexus-shared';
import type { FieldExtractionConfig } from '../generic.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

export const sqlFieldConfig: FieldExtractionConfig = {
  language: SupportedLanguages.SQL,
  typeDeclarationNodes: ['create_table_statement'],
  fieldNodeTypes: ['create_table_column_parameter'],
  bodyNodeTypes: ['create_table_parameters'],
  defaultVisibility: 'public',

  extractName(node: SyntaxNode): string | undefined {
    // create_table_column_parameter: first identifier child is the column name
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (child?.type === 'identifier') return child.text;
    }
    return undefined;
  },

  extractType(node: SyntaxNode): string | undefined {
    // The type node follows the identifier
    let seenIdentifier = false;
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (!child) continue;
      if (child.type === 'identifier') {
        seenIdentifier = true;
        continue;
      }
      if (seenIdentifier && child.type === 'type') return child.text?.trim();
    }
    return undefined;
  },

  extractVisibility(): 'public' {
    // All SQL columns are effectively public within the table
    return 'public';
  },

  isStatic(): false {
    return false;
  },

  isReadonly(): false {
    return false;
  },
};
