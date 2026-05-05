// gitnexus/src/core/ingestion/method-extractors/configs/sql.ts
// Verified against tree-sitter-sql@0.1.0 nodeTypeInfo

import { SupportedLanguages } from 'gitnexus-shared';
import type { MethodExtractionConfig, ParameterInfo } from '../../method-types.js';
import type { SyntaxNode } from '../../utils/ast-helpers.js';

/**
 * Extract the name of a SQL stored function/procedure.
 * In tree-sitter-sql the create_function_statement has an identifier child
 * for the function name.
 */
function extractSqlName(node: SyntaxNode): string | undefined {
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child?.type === 'identifier') return child.text;
  }
  return undefined;
}

/**
 * Extract parameters from create_function_parameters node.
 * Each create_function_parameter has an identifier (name) and type children.
 */
function extractSqlParameters(node: SyntaxNode): ParameterInfo[] {
  const params: ParameterInfo[] = [];

  let paramList: SyntaxNode | null = null;
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child?.type === 'create_function_parameters') {
      paramList = child;
      break;
    }
  }
  if (!paramList) return params;

  for (let i = 0; i < paramList.namedChildCount; i++) {
    const param = paramList.namedChild(i);
    if (!param || param.type !== 'create_function_parameter') continue;

    let name: string | undefined;
    let typeName: string | undefined;

    for (let j = 0; j < param.namedChildCount; j++) {
      const child = param.namedChild(j);
      if (!child) continue;
      if (child.type === 'identifier' && !name) {
        name = child.text;
      } else if (child.type === 'type' && !typeName) {
        typeName = child.text?.trim();
      }
    }

    if (name) {
      params.push({
        name,
        type: typeName ?? null,
        rawType: typeName ?? null,
        isOptional: false,
        isVariadic: false,
      });
    }
  }
  return params;
}

export const sqlMethodConfig: MethodExtractionConfig = {
  language: SupportedLanguages.SQL,
  // SQL stored functions live at the top level (source_file), not inside class-like containers
  typeDeclarationNodes: [],
  methodNodeTypes: ['create_function_statement'],
  bodyNodeTypes: [],

  extractName: extractSqlName,

  extractReturnType(node: SyntaxNode): string | undefined {
    // RETURNS clause: in tree-sitter-sql the return type is a type/setof/array_type
    // child that comes after create_function_parameters in the child list.
    let seenParams = false;
    for (let i = 0; i < node.namedChildCount; i++) {
      const child = node.namedChild(i);
      if (!child) continue;
      if (child.type === 'create_function_parameters') {
        seenParams = true;
        continue;
      }
      if (
        seenParams &&
        (child.type === 'type' || child.type === 'setof' || child.type === 'array_type')
      ) {
        return child.text?.trim();
      }
    }
    return undefined;
  },

  extractParameters: extractSqlParameters,

  extractVisibility(): 'public' {
    // SQL functions are always public within the schema
    return 'public';
  },

  isStatic(): false {
    return false;
  },

  isAbstract(): false {
    return false;
  },

  isFinal(): false {
    return false;
  },
};
