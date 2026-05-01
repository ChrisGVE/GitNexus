/**
 * Bash: basic pipeline integration — functions, source imports, calls, variables.
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
import { isLanguageAvailable } from '../../../src/core/tree-sitter/parser-loader.js';
import { SupportedLanguages } from '../../../src/config/supported-languages.js';

const bashAvailable = isLanguageAvailable(SupportedLanguages.Bash);

describe.skipIf(!bashAvailable)('Bash pipeline integration', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'bash-app'), () => {});
  }, 60000);

  it('detects Bash files', () => {
    const files = getNodesByLabel(result, 'File');
    expect(files).toContain('main.sh');
    expect(files).toContain('utils.sh');
    expect(files).toContain('service.sh');
  });

  it('extracts functions', () => {
    const functions = getNodesByLabel(result, 'Function');
    expect(functions).toContain('main');
    expect(functions).toContain('log_message');
    expect(functions).toContain('format_name');
    expect(functions).toContain('create_user');
    expect(functions).toContain('process_user');
  });

  it('extracts call edges', () => {
    const calls = getRelationships(result, 'CALLS');
    expect(calls.length).toBeGreaterThanOrEqual(1);
    const callNames = calls.map((c) => c.target);
    expect(callNames).toContain('create_user');
  });

  it('extracts source import edges', () => {
    const imports = getRelationships(result, 'IMPORTS');
    expect(imports.length).toBeGreaterThanOrEqual(1);
  });
});
