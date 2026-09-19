import elkLayouts from '@mermaid-js/layout-elk';

export const layoutName = 'cove-flowchart';
const elk = elkLayouts.find(({ name }) => name === 'elk');
const processes = new Set(['rect', 'squareRect', 'proc', 'process', 'rectangle', 'rounded', 'roundedRect', 'event']);
const decisions = new Set(['diamond', 'diam', 'decision', 'question']);

// The loader extension is public; helper signatures are Mermaid internals.
// Pin the supported Mermaid/ELK pair and verify it before upgrading.
export const coveFlowchartLayout = {
  ...elk,
  name: layoutName,
  async loader() {
    const engine = await elk.loader();
    return {
      async render(data, svg, helpers, ...rest) {
        for (const node of data.nodes ?? []) {
          if (node.isGroup) continue;
          if (decisions.has(node.shape) && data.config.flowchart?.decisionStyle !== 'diamond') {
            node.shape = 'rect';
            node.cssClasses = `${node.cssClasses ?? ''} soft-decision`;
          }
          if (processes.has(node.shape)) {
            Object.assign(node, { shape: 'rect', padding: 16, labelPaddingX: 36 });
            node.height = Math.max(60, node.height ?? 0);
          }
        }
        const decorated = {
          ...helpers,
          async insertEdgeLabel(parent, edge) {
            const group = await helpers.insertEdgeLabel(parent, edge);
            const text = group.querySelector('text');
            const box = group.querySelector('rect.background');
            if (!edge.label || !text || !box) return group;
            const bounds = text.getBBox();
            const height = Math.max(26, bounds.height + 8);
            const attributes = {
              x: bounds.x - 12, y: bounds.y - (height - bounds.height) / 2,
              width: bounds.width + 24, height,
            };
            for (const [key, value] of Object.entries(attributes)) box.setAttribute(key, String(value));
            box.style.removeProperty('stroke');
            const outer = group.getBBox();
            edge.width = outer.width;
            edge.height = outer.height;
            group.parentElement?.setAttribute('transform', `translate(${-outer.x - outer.width / 2},${-outer.y - outer.height / 2})`);
            return group;
          },
          insertEdge(parent, edge, ...args) {
            // Round ELK's orthogonal bends without moving labels or graph nodes.
            const points = edge.points?.map((point) => ({ ...point }));
            if (points?.length > 1) {
              for (const [index, neighbor, marker] of [
                [0, 1, edge.arrowTypeStart],
                [points.length - 1, points.length - 2, edge.arrowTypeEnd],
              ]) {
                if (marker !== 'arrow_point') continue;
                const tip = points[index];
                const delta = { x: points[neighbor].x - tip.x, y: points[neighbor].y - tip.y };
                const length = Math.hypot(delta.x, delta.y);
                if (!length) continue;
                const inset = Math.min(8, Math.max(0, length / 2 - 4));
                tip.x += delta.x * inset / length;
                tip.y += delta.y * inset / length;
              }
            }
            return helpers.insertEdge(parent, { ...edge, points, curve: 'rounded' }, ...args);
          },
        };
        await engine.render(data, svg, decorated, ...rest);
        // Only change normal flowchart point markers; preserve circles/crosses.
        for (const marker of svg.node().querySelectorAll('marker')) {
          if (!/-point(?:Start|End)(?:_|$)/.test(marker.id)) continue;
          const start = /-pointStart(?:_|$)/.test(marker.id);
          for (const [name, value] of Object.entries({ viewBox: '-5 -5 10 10', markerWidth: 10, markerHeight: 10, refX: 0, refY: 0 })) {
            marker.setAttribute(name, String(value));
          }
          for (const path of marker.querySelectorAll('path')) {
            path.setAttribute('d', start ? 'M -1 -3 L -4 0 L -1 3 M -4 0 L 0 0' : 'M 1 -3 L 4 0 L 1 3 M 0 0 L 4 0');
            Object.assign(path.style, { fill: 'none', strokeWidth: '1', strokeDasharray: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' });
          }
        }
      },
    };
  },
};

const installed = new WeakSet();
export function register(mermaid) {
  if (installed.has(mermaid)) return;
  mermaid.registerLayoutLoaders([...elkLayouts, coveFlowchartLayout]);
  installed.add(mermaid);
}
