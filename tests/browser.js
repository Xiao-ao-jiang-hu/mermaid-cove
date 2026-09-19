const { default: renderer } = await import(location.search.includes('entry=browser')
  ? '../dist/browser/mermaid-renderer.esm.min.mjs' : '../dist/index.js');
const results = document.querySelector('#results');
const fixtures = document.querySelector('#fixtures');
let failed = 0;
function assert(value, reason) { if (!value) throw new Error(reason); }
function svgDoc(svg) { return new DOMParser().parseFromString(svg, 'image/svg+xml'); }
async function test(name, work) {
  const item = document.createElement('li');
  try { await work(); item.textContent = `PASS: ${name}`; item.className = 'pass'; }
  catch (error) { failed++; item.textContent = `FAIL: ${name}: ${error.message}`; item.className = 'fail'; }
  results.append(item);
}
const source = 'flowchart LR\nA[环境] -->|训练| B[模型]\nB --> C[观测]\nC -->|校准| B';
await test('Chinese labels, cycles, pill geometry and open arrows survive SVG export', async () => {
  renderer.initialize({ darkMode: true });
  const { svg } = await renderer.render('topology', source);
  const doc = svgDoc(svg);
  assert(doc.querySelectorAll('g.node').length === 3, 'node count');
  assert(doc.querySelectorAll('path.flowchart-link').length === 3, 'edge count');
  assert(doc.documentElement.textContent.includes('环境'), 'Chinese text');
  const labels = [...doc.querySelectorAll('.edgeLabel rect.background')];
  assert(labels.filter((el) => Number(el.getAttribute('height')) >= 26).length === 2, 'pill label dimensions');
  assert([...doc.querySelectorAll('marker path')].some((p) => p.style.fill === 'none'), 'open arrow');
  const nodes = [...doc.querySelectorAll('g.node')];
  const xs = nodes.map((node) => Number(node.getAttribute('transform').match(/translate\(([-\d.]+)/)[1]));
  assert(xs[0] < xs[1] && xs[1] < xs[2], 'left-to-right flow through cycle');
});
await test('initialize persists and concurrent themes remain isolated', async () => {
  renderer.initialize({ colors: { node: '#112233' } });
  const first = renderer.render('theme-a', 'flowchart LR\nA --> B');
  renderer.initialize({ colors: { node: '#ddeeff' } });
  const second = renderer.render('theme-b', 'flowchart LR\nA --> B');
  const [a, b] = await Promise.all([first, second]);
  assert(a.svg.includes('#112233') && !a.svg.includes('#ddeeff'), 'first theme changed');
  assert(b.svg.includes('#ddeeff'), 'second theme missing');
});
await test('invalid source rejects, and the next render still works', async () => {
  let rejected = false;
  try { await renderer.render('bad', 'flowchart LR\nA['); } catch { rejected = true; }
  assert(rejected, 'invalid source was accepted');
  const result = await renderer.render('recovered', 'flowchart LR\nA --> B');
  assert(result.svg.includes('<svg'), 'queue did not recover');
});
await test('run processes multiple blocks once and invokes callbacks', async () => {
  fixtures.innerHTML = '<div class="mermaid">flowchart LR\nA --> B</div><div class="mermaid">flowchart TD\nC --> D</div>';
  let callbacks = 0;
  await renderer.run({ postRenderCallback: () => { callbacks++; } });
  assert(fixtures.querySelectorAll('svg').length === 2 && callbacks === 2, 'blocks or callbacks');
  const before = fixtures.innerHTML;
  await renderer.run();
  assert(before === fixtures.innerHTML, 'processed blocks rerendered');
});
await test('subgraphs, self-loop, dashed and thick connections render', async () => {
  renderer.initialize({ darkMode: false });
  const result = await renderer.render('groups', 'flowchart TD\nsubgraph Group\nA --> A\nA -.-> B\nend\nB ==> C');
  const doc = svgDoc(result.svg);
  assert(doc.querySelectorAll('g.node').length >= 3, 'missing nodes');
  assert(doc.querySelector('g.cluster'), 'missing group');
  assert(doc.querySelector('.edge-thickness-thick'), 'thick edge lost');
});
await test('decision diamonds can be preserved explicitly', async () => {
  renderer.initialize({ decisionStyle: 'diamond' });
  const result = await renderer.render('decisions', 'flowchart TD\nA{Continue?} -->|Yes| B[Done]');
  assert(!result.svg.includes('class="node default soft-decision'), 'decision forced to rectangle');
  assert(svgDoc(result.svg).querySelector('g.node polygon'), 'diamond missing');
});
await test('native sequence diagrams still render', async () => {
  const result = await renderer.render('sequence-test', 'sequenceDiagram\nAlice->>Bob: Hello');
  assert(result.svg.includes('Alice') && result.svg.includes('Bob'), 'actors missing');
});
await test('strict Mermaid output contains no scripts or event handlers', async () => {
  const result = await renderer.render('strict-test', 'flowchart LR\nA["<img src=x onerror=alert(1)>"] --> B');
  const doc = svgDoc(result.svg);
  assert(!doc.querySelector('script, iframe'), 'executable element');
  assert(![...doc.querySelectorAll('*')].some((el) => [...el.attributes].some((a) => /^on/i.test(a.name))), 'event attribute');
});
await test('parse remains available', async () => {
  const parsed = await renderer.parse('flowchart LR\nA --> B');
  assert(parsed !== false, 'valid source not parsed');
});
document.body.dataset.status = failed ? 'failed' : 'passed';
document.title = `${failed ? 'FAIL' : 'PASS'} — Renderer regression tests`;
