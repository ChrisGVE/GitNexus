/**
 * Perl type extractor.
 *
 * Perl is dynamically typed with no static type annotations in standard Perl 5.
 * Type inference focuses on:
 *   - `my $var = ClassName->new(...)` constructor patterns (bless-based OO)
 *
 * We provide minimal extractors that recognise variable declaration nodes
 * (variable_declaration) but cannot infer types without runtime information.
 */

import type { LanguageTypeConfig, ParameterExtractor, TypeBindingExtractor } from './types.js';
import type { SyntaxNode } from '../utils/ast-helpers.js';

// Perl variable declarations use: variable_declaration with variable or variables field
// The node does not carry a type annotation in standard Perl 5.

/** Perl declaration node types that may carry type-like information */
const DECLARATION_NODE_TYPES: ReadonlySet<string> = new Set(['variable_declaration']);

/**
 * Extract variable name from a Perl variable_declaration node.
 * No type annotation is available — we only record the variable name.
 */
const extractDeclaration: TypeBindingExtractor = (_node: SyntaxNode, _env: Map<string, string>) => {
  // Perl has no type annotations in standard Perl 5.
  // Constructor-pattern binding is handled by scanConstructorBinding.
};

/**
 * Perl subroutine parameters come from @_ inside the body.
 * We cannot extract typed parameters from the declaration node alone.
 */
const extractParameter: ParameterExtractor = (_node: SyntaxNode, _env: Map<string, string>) => {
  // No formal parameter list with types in standard Perl subs.
};

export const typeConfig: LanguageTypeConfig = {
  declarationNodeTypes: DECLARATION_NODE_TYPES,
  extractDeclaration,
  extractParameter,
};
