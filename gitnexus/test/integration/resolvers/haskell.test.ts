/**
 * Haskell language provider integration tests.
 *
 * Verifies that the pipeline correctly:
 *   - Detects top-level functions as Function nodes
 *   - Detects imports and emits IMPORTS edges
 *   - Records CALLS edges for function applications
 */
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import {
  FIXTURES,
  getRelationships,
  getNodesByLabel,
  runPipelineFromRepo,
  type PipelineResult,
} from './helpers.js';
import {
  isLanguageAvailable,
  loadParser,
  loadLanguage,
} from '../../../src/core/tree-sitter/parser-loader.js';
import { SupportedLanguages } from '../../../src/config/supported-languages.js';

// Probe the parser — isLanguageAvailable only checks module load, not runtime.
let haskellAvailable = isLanguageAvailable(SupportedLanguages.Haskell);
if (haskellAvailable) {
  try {
    await loadParser();
    await loadLanguage(SupportedLanguages.Haskell);
  } catch {
    haskellAvailable = false;
  }
}

// ── Basic function and import detection ──────────────────────────────────────

describe.skipIf(!haskellAvailable)('Haskell: function and import detection', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'haskell-app'), () => {});
  }, 60000);

  it('detects top-level functions in Math.hs', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('add');
    expect(functions).toContain('multiply');
    expect(functions).toContain('factorial');
  });

  it('detects top-level functions in Utils.hs', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('greet');
    expect(functions).toContain('formatResult');
  });

  it('detects main as a Function node', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('main');
  });

  it('creates IMPORTS edge from Main.hs to Math.hs', () => {
    const imports = getRelationships(result, 'IMPORTS');
    const mathImport = imports.find(
      (e) => e.sourceFilePath.includes('Main.hs') && e.targetFilePath.includes('Math.hs'),
    );
    expect(mathImport).toBeDefined();
  });

  it('creates IMPORTS edge from Main.hs to Utils.hs', () => {
    const imports = getRelationships(result, 'IMPORTS');
    const utilsImport = imports.find(
      (e) => e.sourceFilePath.includes('Main.hs') && e.targetFilePath.includes('Utils.hs'),
    );
    expect(utilsImport).toBeDefined();
  });

  it('records CALLS edges from main to add and greet', () => {
    const calls = getRelationships(result, 'CALLS');
    const addCall = calls.find((c) => c.target === 'add' && c.sourceFilePath.includes('Main.hs'));
    expect(addCall).toBeDefined();

    const greetCall = calls.find(
      (c) => c.target === 'greet' && c.sourceFilePath.includes('Main.hs'),
    );
    expect(greetCall).toBeDefined();
  });
});
