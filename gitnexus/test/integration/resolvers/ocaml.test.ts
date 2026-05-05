/**
 * OCaml: basic definition extraction, import resolution, and call detection.
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

// Probe the parser to get a reliable skip guard (same pattern as dart.test.ts).
let ocamlAvailable = isLanguageAvailable(SupportedLanguages.OCaml);
if (ocamlAvailable) {
  try {
    await loadParser();
    await loadLanguage(SupportedLanguages.OCaml);
  } catch {
    ocamlAvailable = false;
  }
}

describe.skipIf(!ocamlAvailable)('OCaml: basic definition and import extraction', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'ocaml-app'), () => {});
  }, 60000);

  it('detects top-level let-bound functions from all three files', () => {
    const fns = getNodesByLabel(result, 'Function');
    expect(fns).toContain('add');
    expect(fns).toContain('multiply');
    expect(fns).toContain('square');
    expect(fns).toContain('greet');
    expect(fns).toContain('format_result');
    expect(fns).toContain('main');
  });

  it('resolves open Math and open Utils as IMPORTS edges from main.ml', () => {
    const imports = getRelationships(result, 'IMPORTS');
    const mathImport = imports.find(
      (e) => e.sourceFilePath.includes('main.ml') && e.targetFilePath.includes('math.ml'),
    );
    const utilsImport = imports.find(
      (e) => e.sourceFilePath.includes('main.ml') && e.targetFilePath.includes('utils.ml'),
    );
    expect(mathImport).toBeDefined();
    expect(utilsImport).toBeDefined();
  });

  it('emits CALLS edges from main to add, square, greet, and format_result', () => {
    const calls = getRelationships(result, 'CALLS');
    const callNames = calls
      .filter((c) => c.sourceFilePath.includes('main.ml'))
      .map((c) => c.target);
    expect(callNames).toContain('add');
    expect(callNames).toContain('square');
    expect(callNames).toContain('greet');
    expect(callNames).toContain('format_result');
  });
});
