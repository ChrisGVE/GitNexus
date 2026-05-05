// gitnexus/src/core/ingestion/heritage-extractors/configs/elixir.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { HeritageExtractionConfig, HeritageInfo } from '../../heritage-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

/**
 * Maximum parent depth when walking up to find the enclosing defmodule.
 */
const MAX_PARENT_DEPTH = 50;

/**
 * Walk up the AST from a `use`/`import`/`alias` call node to find the
 * enclosing defmodule name. The module name is an `alias` node in the
 * arguments of the outer defmodule call.
 */
function findEnclosingModuleName(callNode: SyntaxNode): string | null {
  let current = callNode.parent;
  let depth = 0;
  while (current && ++depth <= MAX_PARENT_DEPTH) {
    // do_block is the body of a defmodule; its parent is the defmodule call
    if (current.type === 'do_block') {
      const defmoduleCall = current.parent;
      if (defmoduleCall?.type === 'call') {
        const target = defmoduleCall.childForFieldName?.('target');
        if (target?.type === 'identifier' && target.text === 'defmodule') {
          const args = defmoduleCall.childForFieldName?.('arguments');
          if (args) {
            for (let i = 0; i < args.namedChildCount; i++) {
              const arg = args.namedChild(i);
              if (arg?.type === 'alias') return arg.text;
            }
          }
        }
      }
    }
    current = current.parent;
  }
  return null;
}

/**
 * Elixir call names that express behaviour injection or module dependency.
 * `use Module` injects behaviour — treated as heritage.
 */
const ELIXIR_HERITAGE_CALL_NAMES: ReadonlySet<string> = new Set(['use']);

/**
 * Elixir heritage extraction config.
 *
 * Elixir expresses module behaviour adoption via `use Module`, which is
 * a macro call that injects callbacks and optional default implementations.
 * This is analogous to Ruby's `include`/`extend` pattern and is handled
 * via callBasedHeritage so the enclosing module name can be resolved.
 */
export const elixirHeritageConfig: HeritageExtractionConfig = {
  language: SupportedLanguages.Elixir,

  callBasedHeritage: {
    callNames: ELIXIR_HERITAGE_CALL_NAMES,

    extract(calledName, callNode, _filePath): HeritageInfo[] {
      if (calledName !== 'use') return [];

      const enclosingModule = findEnclosingModuleName(callNode);
      if (!enclosingModule) return [];

      const args = callNode.childForFieldName?.('arguments');
      if (!args) return [];

      const results: HeritageInfo[] = [];
      for (let i = 0; i < args.namedChildCount; i++) {
        const arg = args.namedChild(i);
        if (arg?.type === 'alias') {
          results.push({
            className: enclosingModule,
            parentName: arg.text,
            kind: 'use', // Elixir's `use` injects behaviour
          });
        }
      }
      return results;
    },
  },
};
