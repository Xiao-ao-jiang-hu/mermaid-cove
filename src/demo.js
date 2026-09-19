import renderer from './index.js';

const source = `flowchart LR
  A[多样化仿真与生成环境]
  B[共享世界表示与动态模型]
  C[推断、预测、检测与场景推演]
  D[主动选择下一步观测]
  E[真实互联网观测]
  A -->|预训练与机制探索| B
  B -->|根据认知缺口补充场景| A
  B --> C
  B --> D
  D --> E
  E -->|学习与校准| B`;
const output = document.querySelector('#diagram');
const code = document.querySelector('#source');
let sequence = 0;
async function update() {
  const current = ++sequence;
  const darkMode = document.querySelector('#theme').value === 'dark';
  document.body.dataset.theme = darkMode ? 'dark' : 'light';
  renderer.initialize({ darkMode });
  try {
    const result = await renderer.render(`preview-${current}`, code.value);
    if (current !== sequence) return;
    output.innerHTML = result.svg;
    output.dataset.status = 'ready';
    result.bindFunctions?.(output);
  } catch (error) {
    if (current !== sequence) return;
    output.textContent = error.message;
    output.dataset.status = 'error';
  }
}
document.querySelector('#render').addEventListener('click', update);
document.querySelector('#theme').addEventListener('change', update);
code.value = source;
update();
