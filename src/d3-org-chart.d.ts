declare module 'd3-org-chart' {
  export class OrgChart<T = any> {
    container(el: HTMLElement): this;
    data(data: T[]): this;
    nodeWidth(fn: (d: any) => number): this;
    nodeHeight(fn: (d: any) => number): this;
    compactMarginBetween(fn: (d: any) => number): this;
    compactMarginPair(fn: (d: any) => number): this;
    siblingsMargin(fn: (d: any) => number): this;
    childrenMargin(fn: (d: any) => number): this;
    neighbourMargin(fn: (a: any, b: any) => number): this;
    compact(val: boolean): this;
    scaleExtent(extent: [number, number]): this;
    nodeContent(fn: (d: any) => string): this;
    onNodeClick(fn: (d: any) => void): this;
    nodeUpdate(fn: (d: any, i: number, arr: any[]) => void): this;
    render(): this;
    collapseAll(): this;
    expandAll(): this;
    fit(): this;
    setCentered(nodeId: string): this;
    setExpanded(nodeId: string, expanded: boolean): this;
  }
}
