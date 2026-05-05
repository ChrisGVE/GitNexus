/**
 * SQL language provider integration test.
 *
 * The tree-sitter-sql@0.1.0 grammar ships no native binding compatible with
 * tree-sitter@0.21.x, so the grammar is registered as optional. All tests
 * use `describe.skipIf(!sqlAvailable)` to degrade gracefully when the grammar
 * cannot be loaded.
 *
 * When a compatible grammar is installed, these tests verify:
 *   - CREATE TABLE is detected as a Class node
 *   - CREATE FUNCTION is detected as a Function node
 *   - Function calls (e.g. get_user_name(1)) produce CALLS edges
 */
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import {
  FIXTURES,
  getNodesByLabel,
  getRelationships,
  runPipelineFromRepo,
  type PipelineResult,
} from './helpers.js';
import {
  isLanguageAvailable,
  loadParser,
  loadLanguage,
} from '../../../src/core/tree-sitter/parser-loader.js';
import { SupportedLanguages } from '../../../src/config/supported-languages.js';

// isLanguageAvailable only checks whether the module loaded; it does NOT verify
// that the native binary works at runtime. Probe the parser for a reliable guard.
let sqlAvailable = isLanguageAvailable(SupportedLanguages.SQL);
if (sqlAvailable) {
  try {
    await loadParser();
    await loadLanguage(SupportedLanguages.SQL);
  } catch {
    sqlAvailable = false;
  }
}

// ── SQL basic parsing ────────────────────────────────────────────────────────

describe.skipIf(!sqlAvailable)('SQL basic parsing', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'sql-app'), () => {});
  }, 60000);

  it('detects tables as Class nodes', () => {
    const classes = getNodesByLabel(result, 'Class');
    expect(classes).toContain('users');
    expect(classes).toContain('orders');
  });

  it('detects stored functions as Function nodes', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('get_user_name');
    expect(functions).toContain('calculate_order_total');
    expect(functions).toContain('count_user_orders');
  });

  it('emits CALLS edges for function calls in queries.sql', () => {
    const calls = getRelationships(result, 'CALLS');
    const calledNames = calls.map((c) => c.target);
    expect(calledNames).toContain('get_user_name');
    expect(calledNames).toContain('calculate_order_total');
    expect(calledNames).toContain('count_user_orders');
  });

  it('resolves get_user_name() call to functions.sql', () => {
    const calls = getRelationships(result, 'CALLS');
    const edge = calls.find(
      (c) => c.target === 'get_user_name' && c.sourceFilePath.includes('queries.sql'),
    );
    expect(edge).toBeDefined();
    expect(edge!.targetFilePath).toContain('functions.sql');
  });
});

// ── Grammar unavailable — provider still type-checks ────────────────────────

describe('SQL provider is registered and type-safe', () => {
  it('SupportedLanguages.SQL enum value is defined', () => {
    expect(SupportedLanguages.SQL).toBe('sql');
  });

  it('isLanguageAvailable does not throw for SQL', () => {
    expect(() => isLanguageAvailable(SupportedLanguages.SQL)).not.toThrow();
  });
});
