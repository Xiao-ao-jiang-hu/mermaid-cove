import mermaid from 'mermaid';
import { register } from './layout.js';
import { createConfig } from './theme.js';
export { install, register, coveFlowchartLayout, layoutName, createConfig } from './plugin.js';

let settings = {};
let queue = Promise.resolve();
let nextId = 0;
function enqueue(work) {
  const pending = queue.then(work);
  queue = pending.catch(() => {});
  return pending;
}

/** Settings are captured per render, so concurrent calls cannot mix themes. */
export function initialize(options = {}) {
  settings = structuredClone(options);
}

export function render(id, source, container) {
  const snapshot = structuredClone(settings);
  return enqueue(async () => {
    if (!/^[A-Za-z][\w-]*$/.test(id)) throw new Error('Diagram id must start with a letter and contain only letters, digits, _ or -.');
    register(mermaid);
    mermaid.initialize(createConfig(snapshot));
    await document.fonts?.ready;
    return mermaid.render(id, source, container);
  });
}

/** Render .mermaid blocks or explicitly supplied nodes, like Mermaid.run(). */
export async function run({ nodes, querySelector = '.mermaid', postRenderCallback } = {}) {
  const elements = nodes ? Array.from(nodes) : [...document.querySelectorAll(querySelector)];
  for (const element of elements) {
    if (element.dataset.processed === 'true') continue;
    let id;
    do { id = `mermaid-cove-${++nextId}`; } while (document.getElementById(id));
    const result = await render(id, element.textContent ?? '');
    element.innerHTML = result.svg;
    element.dataset.processed = 'true';
    result.bindFunctions?.(element);
    await postRenderCallback?.(id);
  }
}

export function parse(source, options) {
  const snapshot = structuredClone(settings);
  return enqueue(() => {
    register(mermaid);
    mermaid.initialize(createConfig(snapshot));
    return mermaid.parse(source, options);
  });
}

export default { initialize, render, run, parse };
