// Deterministic privacy gate: syntax-check every module and fail if browser or
// library code can talk to the network or persist data (RFC 0003 MVP rules).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOTS = ['src', 'demo'];
const FORBIDDEN = [
  /\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /sendBeacon/, /EventSource/,
  /localStorage/, /sessionStorage/, /indexedDB/, /document\.cookie/, /geolocation/,
  /<script[^>]+src=["']https?:/i, /<link[^>]+href=["']https?:/i, /import\s[^;]*["']https?:/,
];
const files = ROOTS.flatMap((r) => readdirSync(r, { recursive: true })
  .filter((f) => /\.(js|mjs|html)$/.test(f)).map((f) => join(r, f)));
const problems = [];
for (const f of files) {
  if (!f.endsWith('.html')) execFileSync(process.execPath, ['--check', f]);
  const text = readFileSync(f, 'utf8');
  for (const re of FORBIDDEN) if (re.test(text)) problems.push(`${f}: forbidden ${re}`);
}
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
if (Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length) problems.push('package.json: no dependencies allowed');
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`check ok: ${files.length} files, no network/persistence APIs, zero dependencies`);
