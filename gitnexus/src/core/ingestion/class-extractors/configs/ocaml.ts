// gitnexus/src/core/ingestion/class-extractors/configs/ocaml.ts

import { SupportedLanguages } from 'gitnexus-shared';
import type { ClassExtractionConfig } from '../../class-types.js';

/**
 * OCaml class (module) extraction config.
 * OCaml's organisational unit is the module. module_definition nodes
 * capture `module Name = struct ... end` and are mapped to Class nodes
 * (the closest analogue in the schema).
 */
export const ocamlClassConfig: ClassExtractionConfig = {
  language: SupportedLanguages.OCaml,
  typeDeclarationNodes: ['module_definition'],
  ancestorScopeNodeTypes: ['module_definition'],
};
