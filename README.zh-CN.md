# Mermaid Cove

让 Mermaid 流程图拥有更柔和的外观：圆角节点、胶囊标签、细线开放式箭头，以及 ELK 分层布局。外观受到 Codex App 启发；本项目非 OpenAI 官方项目。

## 两种接入方式

- **直接替换入口**：提供 `initialize()`、`render()`、`run()`、`parse()`，接收原有 Mermaid 源码，返回 SVG。
- **作为布局插件**：安装到项目已有的 Mermaid 实例，保留原来的渲染调用方式。

## 安装与运行

目前尚未发布 npm，请先从源码构建：

```sh
git clone https://github.com/Xiao-ao-jiang-hu/mermaid-cove.git
cd mermaid-cove
npm ci
npm run build
npm run dev
```

执行 `npm pack` 可生成 `mermaid-cove-0.1.0.tgz`，在目标项目中通过 `npm install /path/to/mermaid-cove-0.1.0.tgz` 安装。

```js
import mermaid from 'mermaid-cove';

mermaid.initialize({ darkMode: true });
const { svg } = await mermaid.render('example', `
flowchart LR
  A[环境] -->|训练| B[模型]
  B --> C[观测]
  C -->|校准| B
`);
document.querySelector('#diagram').innerHTML = svg;
```

已有 Mermaid 项目可使用插件入口：

```js
import mermaid from 'mermaid';
import { install } from 'mermaid-cove/plugin';

install(mermaid, { darkMode: true });
await mermaid.run({ querySelector: '.mermaid' });
```

不使用构建工具时，把整个 `dist/browser/` 目录部署到静态服务器，然后引用：

```html
<script type="module">
  import mermaid from './dist/browser/mermaid-renderer.esm.min.mjs';
  mermaid.initialize({ darkMode: true });
  await mermaid.run();
</script>
```

这是 ESM 入口，必须同时保留其 `chunks/` 目录，并通过 HTTP(S) 访问。无需安装 Codex，也无需请求远程字体或渲染服务。

## 配置与限制

支持明暗主题、字体、颜色和额外 CSS。默认把判断节点显示为虚线圆角框，使用 `decisionStyle: 'diamond'` 可以保留菱形。

固定依赖 Mermaid `11.17.0` 和 `@mermaid-js/layout-elk` `0.1.9`。布局插件入口是公开接口，但内部的节点、标签辅助接口会变化，因此升级依赖前需要运行浏览器回归检查。不能直接假设兼容 Mermaid 12。

目标是相近的布局和外观，不保证与 Codex 像素一致。复杂回路、嵌套分组和字体差异可能改变走线。其他图表类型使用 Mermaid 自身的渲染器和共享主题；本项目并未实现官方对象的所有 API。

## 验证

```sh
npm run check
npm run build
npm run check:types
npm run dev
```

打开开发服务器下的 `/tests/browser.html` 验证 npm 入口；打开 `/tests/browser.html?entry=browser` 验证浏览器发布包；打开 `/tests/plugin.html` 验证已有 Mermaid 实例的接入。前两个页面分别包含 9 项回归检查。GitHub Actions 负责语法、构建、类型和打包检查；浏览器检查目前需手动运行。

## 开源说明

项目源码采用 MIT 许可证，依赖保留各自许可证，完整声明见 `THIRD_PARTY_NOTICES.md`。实现参考了本机 Codex App 的行为和尺寸，使用公开的 Mermaid/ELK 包，不分发 App 安装包、私有资源或运行时。更多配置见 [English README](./README.md)。
