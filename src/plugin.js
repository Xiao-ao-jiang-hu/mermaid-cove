import { register } from './layout.js';
import { createConfig } from './theme.js';
export { coveFlowchartLayout, layoutName, register } from './layout.js';
export { createConfig } from './theme.js';

/** Install on an existing Mermaid singleton. Call before its first render. */
export function install(mermaid, options = {}) {
  register(mermaid);
  mermaid.initialize(createConfig(options));
  return mermaid;
}
export default install;
