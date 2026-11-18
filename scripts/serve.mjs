// Loopback-only static server for the demo (ES modules need http://, not file://).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain' };
const port = Number(process.env.PORT || 4173);

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  if (path === '/' || path === '/demo') { res.writeHead(302, { location: '/demo/' }).end(); return; }
  const file = join(root, path.endsWith('/') ? path + 'index.html' : path);
  if (!file.startsWith(join(root, 'demo')) && !file.startsWith(join(root, 'src'))) { res.writeHead(404).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream',
      'content-security-policy': "default-src 'self'; connect-src 'none'; form-action 'none'" }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(port, '127.0.0.1', () => console.log(`open-healthspan demo: http://127.0.0.1:${port}/`));
