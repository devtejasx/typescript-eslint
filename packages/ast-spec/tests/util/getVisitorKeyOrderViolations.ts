import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { visitorKeys } from '@typescript-eslint/visitor-keys';

export interface VisitorKeyOrderViolation {
  /** The key whose first child starts before `previousKey`'s first child. */
  key: string;
  /** The `type` of the node both keys belong to. */
  nodeType: string;
  /** Start offset of the first child under `key`. */
  offset: number;
  /** The key listed before `key` in `visitorKeys`. */
  previousKey: string;
  /** Start offset of the first child under `previousKey`. */
  previousOffset: number;
}

function isNode(value: unknown): value is TSESTree.Node {
  return (
    typeof value === 'object' &&
    value != null &&
    typeof (value as Partial<TSESTree.Node>).type === 'string' &&
    Array.isArray((value as Partial<TSESTree.Node>).range)
  );
}

/**
 * Collects every place in `ast` where a node's visitor keys are not listed in
 * the order their children appear in the source, which `visitorKeys` documents
 * itself as maintaining.
 *
 * Keys are compared by the start offset of their *first* child, so node types
 * whose keys interleave in the source - `TemplateLiteral`'s `quasis` and
 * `expressions`, or `TSTemplateLiteralType`'s `quasis` and `types` - are
 * handled correctly. A key with no children present on the node is skipped.
 */
export function getVisitorKeyOrderViolations(
  ast: TSESTree.Node,
): VisitorKeyOrderViolation[] {
  const violations: VisitorKeyOrderViolation[] = [];

  const visit = (node: TSESTree.Node): void => {
    let previousKey: string | undefined;
    let previousOffset: number | undefined;

    for (const key of visitorKeys[node.type] ?? []) {
      const value = (node as unknown as Record<string, unknown>)[key];
      const children = (Array.isArray(value) ? value : [value]).filter(isNode);

      if (children.length === 0) {
        continue;
      }

      const offset = Math.min(...children.map(child => child.range[0]));

      if (
        previousKey != null &&
        previousOffset != null &&
        offset < previousOffset
      ) {
        violations.push({
          key,
          nodeType: node.type,
          offset,
          previousKey,
          previousOffset,
        });
      }

      previousKey = key;
      previousOffset = offset;

      for (const child of children) {
        visit(child);
      }
    }
  };

  visit(ast);

  return violations;
}
