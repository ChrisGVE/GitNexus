/**
 * Zig language support integration tests.
 *
 * Tests file detection, function extraction, import resolution, and
 * cross-file call edges using the zig-app fixture.
 *
 * Skipped when tree-sitter-zig is not available (optionalDependency —
 * requires a native build that may not succeed on all platforms).
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

// Probe the parser — isLanguageAvailable only checks module load; native
// binding may still fail at setLanguage time.
let zigAvailable = isLanguageAvailable(SupportedLanguages.Zig);
if (zigAvailable) {
  try {
    await loadParser();
    await loadLanguage(SupportedLanguages.Zig);
  } catch {
    zigAvailable = false;
  }
}

describe.skipIf(!zigAvailable)('Zig: file detection and function extraction', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'zig-app'), () => {});
  }, 60000);

  it('creates File nodes for .zig files', () => {
    const files = getNodesByLabel(result, 'File');
    expect(files.some((f) => f.endsWith('.zig'))).toBe(true);
  });

  it('extracts top-level functions from main.zig', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('main');
  });

  it('extracts functions from math.zig', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('add');
    expect(functions).toContain('multiply');
  });

  it('extracts functions from utils.zig', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('greet');
    expect(functions).toContain('format');
  });

  it('marks pub functions as exported', () => {
    const allFns = getNodesByLabelFull(result, 'Function');
    const add = allFns.find(
      (n) => n.properties.name === 'add' && n.properties.filePath.endsWith('math.zig'),
    );
    expect(add).toBeDefined();
    expect(add!.properties.isExported).toBe(true);
  });

  it('marks non-pub functions as not exported', () => {
    const allFns = getNodesByLabelFull(result, 'Function');
    const helper = allFns.find(
      (n) => n.properties.name === 'helper' && n.properties.filePath.endsWith('math.zig'),
    );
    expect(helper).toBeDefined();
    expect(helper!.properties.isExported).toBe(false);
  });

  it('extracts variables and constants from math.zig', () => {
    const vars = getNodesByLabel(result, 'Variable');
    expect(vars).toContain('PI');
  });
});

describe.skipIf(!zigAvailable)('Zig: import resolution', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'zig-app'), () => {});
  }, 60000);

  it('creates IMPORTS edges from main.zig to math.zig', () => {
    const imports = getRelationships(result, 'IMPORTS');
    const mainToMath = imports.filter(
      (e) => e.sourceFilePath.endsWith('main.zig') && e.targetFilePath.endsWith('math.zig'),
    );
    expect(mainToMath.length).toBeGreaterThanOrEqual(1);
  });

  it('creates IMPORTS edges from main.zig to utils.zig', () => {
    const imports = getRelationships(result, 'IMPORTS');
    const mainToUtils = imports.filter(
      (e) => e.sourceFilePath.endsWith('main.zig') && e.targetFilePath.endsWith('utils.zig'),
    );
    expect(mainToUtils.length).toBeGreaterThanOrEqual(1);
  });
});

describe.skipIf(!zigAvailable)('Zig: cross-file call edges', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'zig-app'), () => {});
  }, 60000);

  it('resolves math.add() CALLS edge from main.zig', () => {
    const calls = getRelationships(result, 'CALLS');
    const addCall = calls.find((c) => c.target === 'add' && c.sourceFilePath.endsWith('main.zig'));
    expect(addCall).toBeDefined();
    expect(addCall!.targetFilePath).toContain('math.zig');
  });

  it('resolves utils.greet() CALLS edge from main.zig', () => {
    const calls = getRelationships(result, 'CALLS');
    const greetCall = calls.find(
      (c) => c.target === 'greet' && c.sourceFilePath.endsWith('main.zig'),
    );
    expect(greetCall).toBeDefined();
    expect(greetCall!.targetFilePath).toContain('utils.zig');
  });
});
