/**
 * Perl language provider — provider registration and pipeline integration tests.
 *
 * NOTE: tree-sitter-perl ^1.0.0 requires tree-sitter ^0.22.0, which is
 * ABI-incompatible with the tree-sitter ^0.21.1 runtime bundled in this project.
 * When the grammar is unavailable, the pipeline silently skips Perl files and
 * all pipeline-level assertions are skipped via `it.skipIf`.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import { SupportedLanguages } from 'gitnexus-shared';
import { isLanguageAvailable } from '../../../src/core/tree-sitter/parser-loader.js';
import { getProvider, getProviderForFile } from '../../../src/core/ingestion/languages/index.js';
import { getLanguageFromFilename } from 'gitnexus-shared';
import { FIXTURES, getNodesByLabel, runPipelineFromRepo, type PipelineResult } from './helpers.js';

const perlAvailable = isLanguageAvailable(SupportedLanguages.Perl);

// ---------------------------------------------------------------------------
// Provider registration — always run, regardless of grammar availability
// ---------------------------------------------------------------------------

describe('Perl provider registration', () => {
  it('is registered in the provider table', () => {
    const provider = getProvider(SupportedLanguages.Perl);
    expect(provider).toBeDefined();
    expect(provider.id).toBe(SupportedLanguages.Perl);
  });

  it('declares the correct extensions', () => {
    const provider = getProvider(SupportedLanguages.Perl);
    expect(provider.extensions).toContain('.pl');
    expect(provider.extensions).toContain('.pm');
    expect(provider.extensions).toContain('.t');
  });

  it('resolves .pl files to the perl provider', () => {
    const provider = getProviderForFile('script.pl');
    expect(provider?.id).toBe(SupportedLanguages.Perl);
  });

  it('resolves .pm files to the perl provider', () => {
    const provider = getProviderForFile('lib/App.pm');
    expect(provider?.id).toBe(SupportedLanguages.Perl);
  });

  it('resolves .t files to the perl provider', () => {
    const provider = getProviderForFile('t/basic.t');
    expect(provider?.id).toBe(SupportedLanguages.Perl);
  });

  it('maps .pl extension to SupportedLanguages.Perl', () => {
    expect(getLanguageFromFilename('main.pl')).toBe(SupportedLanguages.Perl);
  });

  it('maps .pm extension to SupportedLanguages.Perl', () => {
    expect(getLanguageFromFilename('App.pm')).toBe(SupportedLanguages.Perl);
  });

  it('maps .t extension to SupportedLanguages.Perl', () => {
    expect(getLanguageFromFilename('basic.t')).toBe(SupportedLanguages.Perl);
  });

  it('has named import semantics', () => {
    const provider = getProvider(SupportedLanguages.Perl);
    expect(provider.importSemantics).toBe('named');
  });

  it('has an entry point pattern for main', () => {
    const provider = getProvider(SupportedLanguages.Perl);
    const patterns = provider.entryPointPatterns ?? [];
    expect(patterns.some((p) => p.test('main'))).toBe(true);
  });

  it('has non-empty PERL_QUERIES', () => {
    const provider = getProvider(SupportedLanguages.Perl);
    expect(provider.treeSitterQueries.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Pipeline integration — only run if grammar is available
// ---------------------------------------------------------------------------

describe('Perl pipeline integration (requires tree-sitter-perl)', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    if (!perlAvailable) return;
    result = await runPipelineFromRepo(path.join(FIXTURES, 'perl-app'), () => {}, {
      skipGraphPhases: true,
    });
  }, 60000);

  it.skipIf(!perlAvailable)('extracts Function nodes from .pm files', () => {
    const fns = getNodesByLabel(result, 'Function');
    // App.pm: new, run, _log; Math.pm: add, subtract, multiply; Utils.pm: format_result, is_valid
    expect(fns).toContain('new');
    expect(fns).toContain('run');
    expect(fns).toContain('add');
    expect(fns).toContain('subtract');
    expect(fns).toContain('multiply');
    expect(fns).toContain('format_result');
    expect(fns).toContain('is_valid');
  });

  it.skipIf(!perlAvailable)('extracts Module nodes from package declarations', () => {
    const modules = getNodesByLabel(result, 'Module');
    expect(modules).toContain('App');
    expect(modules).toContain('App::Math');
    expect(modules).toContain('App::Utils');
  });

  it.skipIf(!perlAvailable)('extracts Function node from main.pl', () => {
    const fns = getNodesByLabel(result, 'Function');
    expect(fns).toContain('main');
  });

  it.skipIf(!perlAvailable)(
    'produces at least one node when processing the perl-app fixture',
    () => {
      const allNodes: string[] = [];
      result.graph.forEachNode((n) => allNodes.push(n.label));
      expect(allNodes.length).toBeGreaterThan(0);
    },
  );
});
