// gitnexus/src/core/ingestion/method-extractors/configs/ocaml.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { MethodExtractionConfig } from '../../method-types.js';

/**
 * OCaml method extraction config.
 *
 * OCaml does not have class methods in the traditional OO sense.
 * The schema's Method node is not naturally applicable to OCaml, which
 * uses let-bound functions inside modules. We configure a minimal no-op
 * config — no method-node types means no Method nodes will be extracted,
 * and all functions are captured as Function nodes via tree-sitter queries.
 */
export const ocamlMethodConfig: MethodExtractionConfig = {
  language: SupportedLanguages.OCaml,
  typeDeclarationNodes: [],
  methodNodeTypes: [],
  bodyNodeTypes: [],

  extractName(_node) {
    return undefined;
  },

  extractReturnType(_node) {
    return undefined;
  },

  extractParameters(_node) {
    return [];
  },

  extractVisibility(_node) {
    return 'public';
  },

  isStatic(_node) {
    return false;
  },

  isAbstract(_node, _ownerNode) {
    return false;
  },

  isFinal(_node) {
    return false;
  },
};
