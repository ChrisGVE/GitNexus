import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { extractRustWorkspaceLinks } from '../../../src/core/group/extractors/rust-workspace-extractor.js';

describe('RustWorkspaceExtractor', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gitnexus-rust-ws-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  async function writeFile(relPath: string, content: string) {
    const absPath = path.join(tmpDir, relPath);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, content, 'utf-8');
  }

  it('discovers cross-crate imports from workspace dependencies', async () => {
    // Crate A: defines Expression
    await writeFile(
      'crate-a/Cargo.toml',
      `[package]\nname = "mathlex"\nversion = "0.1.0"\n\n[dependencies]\n`,
    );
    await writeFile('crate-a/src/lib.rs', 'pub struct Expression {}\npub struct Token {}\n');

    // Crate B: depends on A via workspace, imports Expression
    await writeFile(
      'crate-b/Cargo.toml',
      `[package]\nname = "thales"\nversion = "0.1.0"\n\n[dependencies]\nmathlex = { workspace = true }\n`,
    );
    await writeFile('crate-b/src/main.rs', 'use mathlex::Expression;\nfn eval(e: Expression) {}\n');

    const repos = {
      'parser/mathlex': 'mathlex',
      'engine/thales': 'thales',
    };
    const repoPaths = new Map([
      ['parser/mathlex', path.join(tmpDir, 'crate-a')],
      ['engine/thales', path.join(tmpDir, 'crate-b')],
    ]);

    const result = await extractRustWorkspaceLinks(repos, repoPaths);

    expect(result.links).toHaveLength(1);
    expect(result.links[0]).toEqual({
      from: 'parser/mathlex',
      to: 'engine/thales',
      type: 'custom',
      contract: 'Expression',
      role: 'provider',
    });
  });

  it('handles hyphenated crate names (converted to underscores in use statements)', async () => {
    await writeFile(
      'units/Cargo.toml',
      `[package]\nname = "mathcore-units"\nversion = "0.1.0"\n\n[dependencies]\n`,
    );
    await writeFile('units/src/lib.rs', 'pub struct Unit {}\npub struct Dimension {}\n');

    await writeFile(
      'engine/Cargo.toml',
      `[package]\nname = "thales"\nversion = "0.1.0"\n\n[dependencies]\nmathcore-units = { workspace = true }\n`,
    );
    await writeFile(
      'engine/src/main.rs',
      'use mathcore_units::Unit;\nuse mathcore_units::Dimension;\n',
    );

    const repos = {
      'core/units': 'mathcore-units',
      'engine/thales': 'thales',
    };
    const repoPaths = new Map([
      ['core/units', path.join(tmpDir, 'units')],
      ['engine/thales', path.join(tmpDir, 'engine')],
    ]);

    const result = await extractRustWorkspaceLinks(repos, repoPaths);

    expect(result.links).toHaveLength(2);
    const contracts = result.links.map((l) => l.contract).sort();
    expect(contracts).toEqual(['Dimension', 'Unit']);
  });

  it('handles grouped imports (use crate::{Type1, Type2})', async () => {
    await writeFile(
      'lib/Cargo.toml',
      `[package]\nname = "shared"\nversion = "0.1.0"\n\n[dependencies]\n`,
    );
    await writeFile('lib/src/lib.rs', 'pub struct Foo {}\npub struct Bar {}\n');

    await writeFile(
      'app/Cargo.toml',
      `[package]\nname = "myapp"\nversion = "0.1.0"\n\n[dependencies]\nshared = { workspace = true }\n`,
    );
    await writeFile('app/src/main.rs', 'use shared::{Foo, Bar};\n');

    const repos = { lib: 'shared', app: 'myapp' };
    const repoPaths = new Map([
      ['lib', path.join(tmpDir, 'lib')],
      ['app', path.join(tmpDir, 'app')],
    ]);

    const result = await extractRustWorkspaceLinks(repos, repoPaths);

    expect(result.links).toHaveLength(2);
    const contracts = result.links.map((l) => l.contract).sort();
    expect(contracts).toEqual(['Bar', 'Foo']);
  });

  it('ignores snake_case imports (functions/modules, not types)', async () => {
    await writeFile(
      'lib/Cargo.toml',
      `[package]\nname = "utils"\nversion = "0.1.0"\n\n[dependencies]\n`,
    );
    await writeFile('lib/src/lib.rs', 'pub fn helper() {}\npub struct Config {}\n');

    await writeFile(
      'app/Cargo.toml',
      `[package]\nname = "myapp"\nversion = "0.1.0"\n\n[dependencies]\nutils = { workspace = true }\n`,
    );
    await writeFile('app/src/main.rs', 'use utils::helper;\nuse utils::Config;\n');

    const repos = { lib: 'utils', app: 'myapp' };
    const repoPaths = new Map([
      ['lib', path.join(tmpDir, 'lib')],
      ['app', path.join(tmpDir, 'app')],
    ]);

    const result = await extractRustWorkspaceLinks(repos, repoPaths);

    expect(result.links).toHaveLength(1);
    expect(result.links[0].contract).toBe('Config');
  });

  it('skips repos without Cargo.toml', async () => {
    await writeFile('js-app/package.json', '{"name": "js-app"}');
    await writeFile('js-app/src/index.ts', 'export const x = 1;');

    const repos = { app: 'js-app' };
    const repoPaths = new Map([['app', path.join(tmpDir, 'js-app')]]);

    const result = await extractRustWorkspaceLinks(repos, repoPaths);

    expect(result.links).toHaveLength(0);
    expect(result.discoveredCrates.size).toBe(0);
  });

  it('deduplicates identical imports from multiple files', async () => {
    await writeFile(
      'lib/Cargo.toml',
      `[package]\nname = "shared"\nversion = "0.1.0"\n\n[dependencies]\n`,
    );
    await writeFile('lib/src/lib.rs', 'pub struct Config {}\n');

    await writeFile(
      'app/Cargo.toml',
      `[package]\nname = "myapp"\nversion = "0.1.0"\n\n[dependencies]\nshared = { workspace = true }\n`,
    );
    await writeFile('app/src/main.rs', 'use shared::Config;\n');
    await writeFile('app/src/other.rs', 'use shared::Config;\n');

    const repos = { lib: 'shared', app: 'myapp' };
    const repoPaths = new Map([
      ['lib', path.join(tmpDir, 'lib')],
      ['app', path.join(tmpDir, 'app')],
    ]);

    const result = await extractRustWorkspaceLinks(repos, repoPaths);

    expect(result.links).toHaveLength(1);
  });

  it('handles path dependencies alongside workspace deps', async () => {
    await writeFile(
      'lib/Cargo.toml',
      `[package]\nname = "mylib"\nversion = "0.1.0"\n\n[dependencies]\n`,
    );
    await writeFile('lib/src/lib.rs', 'pub trait Handler {}\n');

    await writeFile(
      'app/Cargo.toml',
      `[package]\nname = "myapp"\nversion = "0.1.0"\n\n[dependencies]\nmylib = { path = "../lib" }\n`,
    );
    await writeFile('app/src/main.rs', 'use mylib::Handler;\n');

    const repos = { lib: 'mylib', app: 'myapp' };
    const repoPaths = new Map([
      ['lib', path.join(tmpDir, 'lib')],
      ['app', path.join(tmpDir, 'app')],
    ]);

    const result = await extractRustWorkspaceLinks(repos, repoPaths);

    expect(result.links).toHaveLength(1);
    expect(result.links[0].contract).toBe('Handler');
  });

  it('handles nested module imports (use crate::module::Type)', async () => {
    await writeFile(
      'lib/Cargo.toml',
      `[package]\nname = "shared"\nversion = "0.1.0"\n\n[dependencies]\n`,
    );
    await writeFile('lib/src/lib.rs', '');

    await writeFile(
      'app/Cargo.toml',
      `[package]\nname = "myapp"\nversion = "0.1.0"\n\n[dependencies]\nshared = { workspace = true }\n`,
    );
    await writeFile('app/src/main.rs', 'use shared::models::User;\nuse shared::auth::Token;\n');

    const repos = { lib: 'shared', app: 'myapp' };
    const repoPaths = new Map([
      ['lib', path.join(tmpDir, 'lib')],
      ['app', path.join(tmpDir, 'app')],
    ]);

    const result = await extractRustWorkspaceLinks(repos, repoPaths);

    expect(result.links).toHaveLength(2);
    const contracts = result.links.map((l) => l.contract).sort();
    expect(contracts).toEqual(['Token', 'User']);
  });
});
