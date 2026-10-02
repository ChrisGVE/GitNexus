import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  claudeConfigPaths,
  codexHome,
  getEditorTargets,
  hookTarget,
  mcpTarget,
  skillTarget,
} from '../../src/cli/editor-targets.js';

const HOME = path.resolve('/home/user');

describe('claudeConfigPaths', () => {
  it('defaults to ~/.claude with the MCP file beside it in HOME', () => {
    expect(claudeConfigPaths(HOME, {})).toEqual({
      dir: path.join(HOME, '.claude'),
      mcpFile: path.join(HOME, '.claude.json'),
    });
  });

  it('moves both the config dir and .claude.json under CLAUDE_CONFIG_DIR', () => {
    const relocated = path.resolve('/cfg/claude');
    expect(claudeConfigPaths(HOME, { CLAUDE_CONFIG_DIR: relocated })).toEqual({
      dir: relocated,
      mcpFile: path.join(relocated, '.claude.json'),
    });
  });

  it('treats an empty CLAUDE_CONFIG_DIR as unset', () => {
    expect(claudeConfigPaths(HOME, { CLAUDE_CONFIG_DIR: '' })).toEqual(claudeConfigPaths(HOME, {}));
  });

  it('resolves a relative CLAUDE_CONFIG_DIR against the working directory', () => {
    const { dir, mcpFile } = claudeConfigPaths(HOME, { CLAUDE_CONFIG_DIR: 'rel/claude' });
    expect(dir).toBe(path.resolve('rel/claude'));
    expect(mcpFile).toBe(path.join(path.resolve('rel/claude'), '.claude.json'));
  });
});

describe('getEditorTargets — Claude Code under CLAUDE_CONFIG_DIR', () => {
  const relocated = path.resolve('/cfg/claude');
  const env = { CLAUDE_CONFIG_DIR: relocated };

  it('routes the MCP file, skills, settings and hook scripts to the relocated root', () => {
    expect(mcpTarget('claude', HOME, env).file).toBe(path.join(relocated, '.claude.json'));
    expect(skillTarget('claude', HOME, env).dir).toBe(path.join(relocated, 'skills'));
    const hooks = hookTarget('claude', HOME, env);
    expect(hooks.settingsFile).toBe(path.join(relocated, 'settings.json'));
    expect(hooks.scriptDir).toBe(path.join(relocated, 'hooks', 'gitnexus'));
  });

  it('leaves every other editor rooted at HOME', () => {
    const relocatedTargets = getEditorTargets(HOME, env);
    const defaultTargets = getEditorTargets(HOME, {});
    const others = <T extends { id: string }>(list: T[]) => list.filter((t) => t.id !== 'claude');
    expect(others(relocatedTargets.mcpJsonc)).toEqual(others(defaultTargets.mcpJsonc));
    expect(others(relocatedTargets.skills)).toEqual(others(defaultTargets.skills));
    expect(others(relocatedTargets.hooks)).toEqual(others(defaultTargets.hooks));
    expect(relocatedTargets.codex).toEqual(defaultTargets.codex);
  });
});

describe('codexHome', () => {
  it('defaults to ~/.codex', () => {
    expect(codexHome(HOME, {})).toBe(path.join(HOME, '.codex'));
  });

  it('uses CODEX_HOME when it is set', () => {
    const relocated = path.resolve('/cfg/codex');
    expect(codexHome(HOME, { CODEX_HOME: relocated })).toBe(relocated);
  });

  it('treats an empty CODEX_HOME as unset', () => {
    expect(codexHome(HOME, { CODEX_HOME: '' })).toBe(path.join(HOME, '.codex'));
  });

  it('resolves a relative CODEX_HOME against the working directory', () => {
    expect(codexHome(HOME, { CODEX_HOME: 'rel/codex' })).toBe(path.resolve('rel/codex'));
  });
});

describe('getEditorTargets — Codex under CODEX_HOME', () => {
  const relocated = path.resolve('/cfg/codex');
  const env = { CODEX_HOME: relocated };

  it('routes config.toml, hooks.json and hook scripts to the relocated root', () => {
    expect(getEditorTargets(HOME, env).codex.configFile).toBe(path.join(relocated, 'config.toml'));
    const hooks = hookTarget('codex', HOME, env);
    expect(hooks.settingsFile).toBe(path.join(relocated, 'hooks.json'));
    expect(hooks.scriptDir).toBe(path.join(relocated, 'hooks', 'gitnexus'));
  });

  it('keeps Codex skills in ~/.agents/skills, which CODEX_HOME does not move', () => {
    expect(skillTarget('codex', HOME, env).dir).toBe(path.join(HOME, '.agents', 'skills'));
  });

  it('leaves every other editor rooted at HOME', () => {
    const relocatedTargets = getEditorTargets(HOME, env);
    const defaultTargets = getEditorTargets(HOME, {});
    const others = <T extends { id: string }>(list: T[]) => list.filter((t) => t.id !== 'codex');
    expect(relocatedTargets.mcpJsonc).toEqual(defaultTargets.mcpJsonc);
    expect(relocatedTargets.skills).toEqual(defaultTargets.skills);
    expect(others(relocatedTargets.hooks)).toEqual(others(defaultTargets.hooks));
  });
});
