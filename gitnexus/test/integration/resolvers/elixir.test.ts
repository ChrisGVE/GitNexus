/**
 * Elixir: module detection, function extraction, import resolution, and call edges.
 *
 * Verifies that the Elixir language provider correctly:
 * - Detects defmodule as Class nodes
 * - Extracts def functions as Function nodes (public)
 * - Treats defp functions as private (not exported)
 * - Resolves alias directives to IMPORTS edges
 * - Emits CALLS edges for cross-module function calls
 */
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import {
  FIXTURES,
  getRelationships,
  getNodesByLabel,
  getNodesByLabelFull,
  runPipelineFromRepo,
  type PipelineResult,
} from './helpers.js';
import {
  isLanguageAvailable,
  loadParser,
  loadLanguage,
} from '../../../src/core/tree-sitter/parser-loader.js';
import { SupportedLanguages } from '../../../src/config/supported-languages.js';

// Elixir grammar is optional — probe the parser to get a reliable skip guard.
let elixirAvailable = isLanguageAvailable(SupportedLanguages.Elixir);
if (elixirAvailable) {
  try {
    await loadParser();
    await loadLanguage(SupportedLanguages.Elixir);
  } catch {
    elixirAvailable = false;
  }
}

describe.skipIf(!elixirAvailable)('Elixir language support', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'elixir-app'), () => {});
  }, 60000);

  // ── Module (Class node) detection ────────────────────────────────────

  it('detects defmodule as Class nodes', () => {
    const classes = getNodesByLabel(result, 'Class');
    expect(classes).toContain('ElixirApp.App');
    expect(classes).toContain('ElixirApp.Math');
    expect(classes).toContain('ElixirApp.Utils');
  });

  // ── Function extraction ───────────────────────────────────────────────

  it('extracts public def functions', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('run');
    expect(functions).toContain('greet');
    expect(functions).toContain('add');
    expect(functions).toContain('multiply');
    expect(functions).toContain('format');
    expect(functions).toContain('upcase');
  });

  it('extracts defp private functions', () => {
    const functions = getNodesByLabel(result, 'Function');
    // defp functions are still captured as Function nodes but marked non-exported
    expect(functions).toContain('internal_helper');
    expect(functions).toContain('private_helper');
  });

  it('marks def functions as exported', () => {
    const allFunctions = getNodesByLabelFull(result, 'Function');
    const addFn = allFunctions.find(
      (n) => n.properties.name === 'add' && n.properties.filePath.includes('math.ex'),
    );
    expect(addFn).toBeDefined();
    expect(addFn!.properties.isExported).toBe(true);
  });

  it('marks defp functions as not exported', () => {
    const allFunctions = getNodesByLabelFull(result, 'Function');
    const privateFn = allFunctions.find(
      (n) => n.properties.name === 'internal_helper' && n.properties.filePath.includes('math.ex'),
    );
    expect(privateFn).toBeDefined();
    expect(privateFn!.properties.isExported).toBe(false);
  });

  // ── File nodes ────────────────────────────────────────────────────────

  it('creates File nodes for .ex files', () => {
    const files = getNodesByLabel(result, 'File');
    expect(files.some((f) => f.endsWith('.ex'))).toBe(true);
  });

  // ── Import resolution ─────────────────────────────────────────────────

  it('resolves alias directives to IMPORTS edges', () => {
    const imports = getRelationships(result, 'IMPORTS');
    const appImports = imports.filter((e) => e.sourceFilePath.includes('app.ex'));
    // app.ex aliases ElixirApp.Math and ElixirApp.Utils
    expect(appImports.length).toBeGreaterThanOrEqual(2);
  });

  it('emits an IMPORTS edge from app.ex to math.ex', () => {
    const imports = getRelationships(result, 'IMPORTS');
    const appToMath = imports.filter(
      (e) => e.sourceFilePath.includes('app.ex') && e.targetFilePath.includes('math.ex'),
    );
    expect(appToMath.length).toBeGreaterThanOrEqual(1);
  });

  it('emits an IMPORTS edge from app.ex to utils.ex', () => {
    const imports = getRelationships(result, 'IMPORTS');
    const appToUtils = imports.filter(
      (e) => e.sourceFilePath.includes('app.ex') && e.targetFilePath.includes('utils.ex'),
    );
    expect(appToUtils.length).toBeGreaterThanOrEqual(1);
  });

  // ── Call edges ────────────────────────────────────────────────────────

  it('emits CALLS edges for cross-module function calls', () => {
    const calls = getRelationships(result, 'CALLS');
    // app.ex calls Math.add and Utils.format
    const addCalls = calls.filter((e) => e.target === 'add' && e.sourceFilePath.includes('app.ex'));
    expect(addCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('emits a CALLS edge for Utils.format from app.ex', () => {
    const calls = getRelationships(result, 'CALLS');
    const formatCalls = calls.filter(
      (e) => e.target === 'format' && e.sourceFilePath.includes('app.ex'),
    );
    expect(formatCalls.length).toBeGreaterThanOrEqual(1);
  });
});
