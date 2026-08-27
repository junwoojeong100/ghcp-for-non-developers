// Docs integrity check: internal anchors + relative links/images.
// Used by CI (.github/workflows/docs-check.yml) and runnable locally:
//   npm install github-slugger && node scripts/check-docs.mjs
import GithubSlugger from 'github-slugger';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const FILES = ['README.md', 'README.ko.md', 'facilitator/preflight.md', 'facilitator/preflight.ko.md', 'examples/README.md'];

let fail = false;
for (const file of FILES) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { console.log(`skip (missing): ${file}`); continue; }
  const text = fs.readFileSync(full, 'utf8');
  const slugger = new GithubSlugger();
  const slugs = new Set();
  let fence = false;
  for (const line of text.split('\n')) {
    if (/^```/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) slugs.add(slugger.slug(m[2].replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1').trim()));
  }
  const anchors = [...text.matchAll(/\]\(#([^)]+)\)/g)].map(x => decodeURIComponent(x[1]));
  const badAnchors = [...new Set(anchors.filter(a => !slugs.has(a)))];
  const rels = [...text.matchAll(/\]\((?!https?:|#|mailto:)([^)#\s]+)(?:#[^)]*)?\)/g)].map(x => x[1]);
  const badRels = [...new Set(rels.filter(p => !fs.existsSync(path.join(ROOT, path.dirname(file), p)) && !fs.existsSync(path.join(ROOT, p))))];
  const ok = !badAnchors.length && !badRels.length;
  console.log(`${ok ? 'OK ' : 'FAIL'} ${file} — anchors: ${anchors.length}, relative links: ${rels.length}`);
  if (badAnchors.length) { fail = true; badAnchors.forEach(a => console.log(`   broken anchor: #${a}`)); }
  if (badRels.length) { fail = true; badRels.forEach(p => console.log(`   missing file: ${p}`)); }
}
process.exit(fail ? 1 : 0);
