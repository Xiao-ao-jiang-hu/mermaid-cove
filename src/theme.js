export function createConfig(options = {}) {
  const darkMode = options.darkMode ?? true;
  const palette = darkMode
    ? { node: '#192d29', text: '#a5cfca', line: '#a5cfca', border: '#34433f', label: '#181818' }
    : { node: '#eaf5f2', text: '#285e57', line: '#568d85', border: '#c6d8d3', label: '#ffffff' };
  const c = { ...palette, ...options.colors };
  const themeCSS = `
.node text { font-size:14px; font-weight:600; fill:${c.text}; }
.edgeLabels text { font-size:13px; font-weight:600; letter-spacing:-0.08px; fill:${c.text}; }
.node tspan[font-weight="normal"], .edgeLabels tspan[font-weight="normal"] { font-weight:600; }
.edgeLabel .label rect { opacity:1; rx:13px; ry:13px; fill:${c.label}; stroke:${c.line}; stroke-width:1px; }
.node .label-container { fill:${c.node}; stroke:${c.border}; stroke-width:1px; }
.node rect.label-container { rx:16px; ry:16px; }
.node.soft-decision .label-container { fill:${c.label}; stroke:${c.line}; stroke-dasharray:2 2; }
.edgePaths .flowchart-link { stroke:${c.line}; stroke-linecap:round; stroke-linejoin:round; }
.edgePaths .edge-thickness-normal { stroke-width:1px; }
.marker { fill:${c.line}; stroke:${c.line}; }
`;
  const custom = options.mermaid ?? {};
  return {
    ...custom,
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
    theme: 'base',
    darkMode,
    htmlLabels: false,
    layout: 'cove-flowchart',
    elk: {
      cycleBreakingStrategy: 'MODEL_ORDER',
      considerModelOrder: 'NODES_AND_EDGES',
      ...custom.elk,
    },
    fontFamily: options.fontFamily ?? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    themeCSS: themeCSS + (options.themeCSS ?? ''),
    themeVariables: {
      darkMode, fontSize: '14px', background: 'transparent',
      primaryColor: c.node, primaryTextColor: c.text, primaryBorderColor: c.border,
      lineColor: c.line, textColor: c.text, mainBkg: c.node, nodeBorder: c.border,
      edgeLabelBackground: c.label, clusterBkg: c.label, clusterBorder: c.border,
      ...custom.themeVariables, ...options.themeVariables,
    },
    flowchart: {
      ...custom.flowchart, useMaxWidth: false, htmlLabels: false,
      decisionStyle: options.decisionStyle ?? 'rounded',
    },
  };
}
