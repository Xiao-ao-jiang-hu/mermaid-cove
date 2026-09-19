import type { Mermaid, MermaidConfig, LayoutLoaderDefinition } from 'mermaid';
export interface RendererOptions {
  darkMode?: boolean;
  fontFamily?: string;
  decisionStyle?: 'rounded' | 'diamond';
  colors?: Partial<Record<'node' | 'text' | 'line' | 'border' | 'label', string>>;
  themeCSS?: string;
  themeVariables?: MermaidConfig['themeVariables'];
  mermaid?: MermaidConfig;
}
export declare const layoutName: 'cove-flowchart';
export declare const coveFlowchartLayout: LayoutLoaderDefinition;
export declare function register(mermaid: Mermaid): void;
export declare function createConfig(options?: RendererOptions): MermaidConfig;
export declare function install(mermaid: Mermaid, options?: RendererOptions): Mermaid;
export default install;
