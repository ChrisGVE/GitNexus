/**
 * SQL Language Provider
 *
 * Generic SQL support — targets PostgreSQL/ANSI SQL with tree-sitter-sql.
 *
 * Key traits:
 *   - importSemantics: 'wildcard-leaf' — SQL has no import system; all objects
 *     exist in the shared database namespace.
 *   - exportChecker: everything is public (no private SQL objects).
 *   - No classes, no inheritance, no modules.
 *   - Stored functions and procedures are treated as Function nodes.
 *   - CREATE TABLE is mapped to a Class node (table ≈ type).
 *   - The tree-sitter-sql@0.1.0 grammar has no native binding compatible with
 *     tree-sitter@0.21.x. The grammar source is registered as `optional: true`
 *     in parser-loader so SQL files are gracefully skipped when the grammar
 *     cannot be loaded.
 */

import { SupportedLanguages } from 'gitnexus-shared';
import { defineLanguage } from '../language-provider.js';
import { createClassExtractor } from '../class-extractors/generic.js';
import { sqlClassConfig } from '../class-extractors/configs/sql.js';
import { createFieldExtractor } from '../field-extractors/generic.js';
import { sqlFieldConfig } from '../field-extractors/configs/sql.js';
import { createMethodExtractor } from '../method-extractors/generic.js';
import { sqlMethodConfig } from '../method-extractors/configs/sql.js';
import { createVariableExtractor } from '../variable-extractors/generic.js';
import { sqlVariableConfig } from '../variable-extractors/configs/sql.js';
import { createCallExtractor } from '../call-extractors/generic.js';
import { sqlCallConfig } from '../call-extractors/configs/sql.js';
import { createImportResolver } from '../import-resolvers/resolver-factory.js';
import { sqlImportConfig } from '../import-resolvers/configs/sql.js';
import { SQL_QUERIES } from '../tree-sitter-queries.js';

/**
 * SQL built-in keywords and aggregate/scalar functions.
 * These names are never resolved to user-defined symbols.
 */
const BUILT_INS: ReadonlySet<string> = new Set([
  'SELECT',
  'INSERT',
  'UPDATE',
  'DELETE',
  'CREATE',
  'ALTER',
  'DROP',
  'GRANT',
  'REVOKE',
  'COMMIT',
  'ROLLBACK',
  'BEGIN',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'COALESCE',
  'NULLIF',
  'CAST',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'EXISTS',
  'IN',
  'BETWEEN',
  'LIKE',
  'IS NULL',
  'UPPER',
  'LOWER',
  'TRIM',
  'SUBSTRING',
  'LENGTH',
  'NOW',
  'CURRENT_TIMESTAMP',
  'count',
  'sum',
  'avg',
  'min',
  'max',
  'coalesce',
  'nullif',
  'cast',
  'upper',
  'lower',
  'trim',
  'substring',
  'length',
  'now',
]);

export const sqlProvider = defineLanguage({
  id: SupportedLanguages.SQL,
  extensions: ['.sql'],
  entryPointPatterns: [],
  astFrameworkPatterns: [],
  treeSitterQueries: SQL_QUERIES,
  typeConfig: {
    declarationNodeTypes: new Set(),
    extractDeclaration: () => null,
    extractParameter: () => null,
  },
  exportChecker: () => true, // All SQL objects are public
  importResolver: createImportResolver(sqlImportConfig),
  importSemantics: 'wildcard-leaf',
  callExtractor: createCallExtractor(sqlCallConfig),
  fieldExtractor: createFieldExtractor(sqlFieldConfig),
  methodExtractor: createMethodExtractor(sqlMethodConfig),
  variableExtractor: createVariableExtractor(sqlVariableConfig),
  classExtractor: createClassExtractor(sqlClassConfig),
  builtInNames: BUILT_INS,
});
