import type { FolderNode, LayoutNode, LayoutLink, LayoutResult } from './types';

const NODE_W_FOLDER = 96;
const NODE_W_PILE = 90;
export const NODE_H = 110;
export const FOLDER_H = 70;
const H_SPACING = 18;
const V_SPACING = 42;

interface ViewNode {
  ref: FolderNode;
  kind: 'folder' | 'pile';
  id: string;
  depth: number;
  children: ViewNode[];
  width: number;
  isOpen: boolean;
  subtreeWidth: number;
  x: number;
  y: number;
}

export function layoutTree(
  root: FolderNode,
  expanded: Set<string>,
  hideDollar: boolean,
): LayoutResult {
  function buildView(node: FolderNode, depth: number): ViewNode {
    const isOpen = expanded.has(node.id);
    const visibleChildren: ViewNode[] = [];

    if (isOpen) {
      for (const child of node.children) {
        if (hideDollar && child.name.startsWith('$')) continue;
        visibleChildren.push(buildView(child, depth + 1));
      }
      if (node.files.length > 0) {
        visibleChildren.push({
          ref: node,
          kind: 'pile',
          id: node.id + '__files',
          depth: depth + 1,
          children: [],
          width: NODE_W_PILE,
          isOpen: false,
          subtreeWidth: 0,
          x: 0,
          y: 0,
        });
      }
    }

    return {
      ref: node,
      kind: 'folder',
      id: node.id,
      depth,
      children: visibleChildren,
      width: NODE_W_FOLDER,
      isOpen,
      subtreeWidth: 0,
      x: 0,
      y: 0,
    };
  }

  const view = buildView(root, 0);

  function computeSubtreeWidth(n: ViewNode): number {
    if (n.children.length === 0) {
      n.subtreeWidth = n.width;
      return n.subtreeWidth;
    }
    let total = 0;
    for (const c of n.children) {
      total += computeSubtreeWidth(c);
    }
    total += (n.children.length - 1) * H_SPACING;
    n.subtreeWidth = Math.max(n.width, total);
    return n.subtreeWidth;
  }
  computeSubtreeWidth(view);

  function position(n: ViewNode, cx: number, cy: number): void {
    n.x = cx;
    n.y = cy;
    if (n.children.length === 0) return;
    const childY = cy + NODE_H + V_SPACING;
    let childrenTotalWidth = 0;
    for (const c of n.children) childrenTotalWidth += c.subtreeWidth;
    childrenTotalWidth += (n.children.length - 1) * H_SPACING;
    let cursor = cx - childrenTotalWidth / 2;
    for (const c of n.children) {
      const childCx = cursor + c.subtreeWidth / 2;
      position(c, childCx, childY);
      cursor += c.subtreeWidth + H_SPACING;
    }
  }
  position(view, 0, NODE_H / 2);

  let minX = Infinity, maxX = -Infinity, maxY = 0;
  function bounds(n: ViewNode): void {
    minX = Math.min(minX, n.x - n.width / 2);
    maxX = Math.max(maxX, n.x + n.width / 2);
    maxY = Math.max(maxY, n.y + NODE_H);
    for (const c of n.children) bounds(c);
  }
  bounds(view);

  const padX = 40;
  const padY = 40;
  const shiftX = padX - minX;
  function applyShift(n: ViewNode): void {
    n.x += shiftX;
    for (const c of n.children) applyShift(c);
  }
  applyShift(view);

  const nodes: LayoutNode[] = [];
  const links: LayoutLink[] = [];
  function flatten(n: ViewNode, parent: ViewNode | null): void {
    const ln: LayoutNode = {
      id: n.id,
      kind: n.kind,
      x: n.x,
      y: n.y,
      w: n.width,
      depth: n.depth,
      data: n.ref,
      parentId: parent ? parent.id : null,
      isOpen: n.isOpen,
      hasHiddenChildren: n.kind === 'folder' && !n.isOpen &&
        (n.ref.children.length > 0 || n.ref.files.length > 0),
    };
    nodes.push(ln);
    if (parent) {
      const parentNode = nodes.find((x) => x.id === parent.id);
      if (parentNode) links.push({ from: parentNode, to: ln });
    }
    for (const c of n.children) flatten(c, n);
  }
  flatten(view, null);

  return {
    nodes,
    links,
    bounds: { w: (maxX - minX) + padX * 2, h: maxY + padY * 2 },
  };
}

export function linkPath(from: LayoutNode, to: LayoutNode): string {
  const x1 = from.x;
  const y1 = from.y + FOLDER_H / 2;
  const x2 = to.x;
  const y2 = to.y - FOLDER_H / 2;
  const midY = (y1 + y2) / 2;
  const r = 6;

  if (Math.abs(x1 - x2) < 1) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  const dir = x2 > x1 ? 1 : -1;
  return `M ${x1} ${y1} L ${x1} ${midY - r} Q ${x1} ${midY}, ${x1 + r * dir} ${midY} L ${x2 - r * dir} ${midY} Q ${x2} ${midY}, ${x2} ${midY + r} L ${x2} ${y2}`;
}
