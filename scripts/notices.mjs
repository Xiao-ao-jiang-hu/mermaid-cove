import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
const seen = new Set();
const notices = [];
async function visit(name, from = process.cwd()) {
  let location = from;
  let file;
  while (true) {
    const candidate = resolve(location, 'node_modules', name, 'package.json');
    try { await readFile(candidate); file = candidate; break; } catch {}
    const parent = dirname(location);
    if (parent === location) throw new Error(`Cannot resolve license for ${name}`);
    location = parent;
  }
  if (seen.has(file)) return;
  seen.add(file);
  const pkg = JSON.parse(await readFile(file, 'utf8'));
  const licenses = (await readdir(dirname(file))).filter((name) => /^(licen[sc]e|copying|notice)(\.|$)/i.test(name));
  notices.push(`## ${pkg.name}@${pkg.version}\n\nDeclared license: ${JSON.stringify(pkg.license ?? 'see upstream')}\n`);
  if (!licenses.length) {
    const readme = await readFile(resolve(dirname(file), 'README.md'), 'utf8');
    const section = readme.match(/^## License\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/im)?.[1];
    if (!section) throw new Error(`Missing license text for ${pkg.name}`);
    notices.push(`### License from README.md\n\n${section}\n`);
  }
  for (const license of licenses) notices.push(`### ${license}\n\n${await readFile(resolve(dirname(file), license), 'utf8')}\n`);
  for (const dependency of Object.keys(pkg.dependencies ?? {}).sort()) await visit(dependency, dirname(file));
}
await visit('mermaid');
await visit('@mermaid-js/layout-elk');
await writeFile('THIRD_PARTY_NOTICES.md', `# Third-party notices\n\nPublic runtime dependencies and their transitive dependencies. The browser build bundles these components; not every dependency is necessarily included in every chunk.\n\n${notices.join('\n')}`.trimEnd() + '\n');
console.log(`Collected ${seen.size} package notices.`);
