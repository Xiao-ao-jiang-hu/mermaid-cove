import type { Mermaid } from 'mermaid';
import type { RendererOptions } from './plugin.js';
export * from './plugin.js';
export declare function initialize(options?: RendererOptions): void;
export declare const render: Mermaid['render'];
export declare const parse: Mermaid['parse'];
export declare function run(options?: {
  nodes?: ArrayLike<HTMLElement>;
  querySelector?: string;
  postRenderCallback?: (id: string) => void | Promise<void>;
}): Promise<void>;
declare const renderer: { initialize: typeof initialize; render: typeof render; parse: typeof parse; run: typeof run };
export default renderer;
