/**
 * Erlang: basic language provider registration and pipeline smoke test.
 *
 * The `tree-sitter-erlang` npm package (0.0.1-security) is a security
 * placeholder; the grammar is unavailable at install time.  All test cases
 * are guarded with `describe.skipIf(!erlangAvailable)` so CI passes until the
 * real grammar is vendored from https://github.com/WhatsApp/tree-sitter-erlang.
 *
 * Once the grammar is vendored, these tests will exercise:
 *   - Function node extraction from `-module` / `function` AST nodes
 *   - Export detection via `-export([name/arity])` attributes
 *   - Cross-module call edges (`math_utils:add/2`, `string_utils:greet/1`)
 *   - Behaviour heritage (`-behaviour(gen_server)`)
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

// Probe whether the Erlang grammar is actually loadable at runtime.
// isLanguageAvailable only checks module load; setLanguage may still fail.
let erlangAvailable = isLanguageAvailable(SupportedLanguages.Erlang);
if (erlangAvailable) {
  try {
    await loadParser();
    await loadLanguage(SupportedLanguages.Erlang);
  } catch {
    erlangAvailable = false;
  }
}

// ── Language enum registration (always runs) ──────────────────────────────

describe('Erlang language registration', () => {
  it('has SupportedLanguages.Erlang enum member', () => {
    expect(SupportedLanguages.Erlang).toBe('erlang');
  });

  it('recognises .erl and .hrl extensions', async () => {
    const { getLanguageFromFilename } = await import('gitnexus-shared');
    expect(getLanguageFromFilename('server.erl')).toBe(SupportedLanguages.Erlang);
    expect(getLanguageFromFilename('server.hrl')).toBe(SupportedLanguages.Erlang);
    expect(getLanguageFromFilename('main.py')).not.toBe(SupportedLanguages.Erlang);
  });

  it('has a registered language provider', async () => {
    const { getProvider } = await import('../../../src/core/ingestion/languages/index.js');
    const provider = getProvider(SupportedLanguages.Erlang);
    expect(provider).toBeDefined();
    expect(provider.id).toBe(SupportedLanguages.Erlang);
    expect(provider.extensions).toContain('.erl');
    expect(provider.extensions).toContain('.hrl');
  });

  it('classifies Erlang as experimental', async () => {
    const { LanguageClassifications } = await import('gitnexus-shared');
    expect(LanguageClassifications[SupportedLanguages.Erlang]).toBe('experimental');
  });
});

// ── Pipeline integration (skipped until grammar is vendored) ─────────────

describe.skipIf(!erlangAvailable)('Erlang pipeline: erlang-app fixture', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipelineFromRepo(path.join(FIXTURES, 'erlang-app'), () => {});
  }, 60000);

  it('detects functions from all three modules', () => {
    const fns = getNodesByLabel(result, 'Function');
    expect(fns).toEqual(
      expect.arrayContaining([
        'main',
        'start',
        'add',
        'subtract',
        'multiply',
        'factorial',
        'greet',
        'join',
      ]),
    );
  });

  it('emits CALLS edges for cross-module remote calls', () => {
    const calls = getRelationships(result, 'CALLS');
    const addCall = calls.find((c) => c.target === 'add' && c.sourceFilePath.includes('main.erl'));
    expect(addCall).toBeDefined();
    expect(addCall!.targetFilePath).toContain('math_utils.erl');
  });

  it('emits CALLS edges for string_utils:greet', () => {
    const calls = getRelationships(result, 'CALLS');
    const greetCall = calls.find(
      (c) => c.target === 'greet' && c.sourceFilePath.includes('main.erl'),
    );
    expect(greetCall).toBeDefined();
    expect(greetCall!.targetFilePath).toContain('string_utils.erl');
  });

  it('detects -behaviour(gen_server) heritage', () => {
    const heritage = getRelationships(result, 'IMPLEMENTS');
    const genServerImpl = heritage.find(
      (h) => h.target === 'gen_server' && h.sourceFilePath.includes('main.erl'),
    );
    expect(genServerImpl).toBeDefined();
  });
});
