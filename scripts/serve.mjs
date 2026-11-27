// Loopback-only static server for the site and demo (ES modules need http://, not file://).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain', '.ttf': 'font/ttf', '.png': 'image/png' };
const port = Number(process.env.PORT || 4173);

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  if (path === '/' || path === '/site') { res.writeHead(302, { location: '/site/' }).end(); return; }
  if (path === '/demo') { res.writeHead(302, { location: '/demo/' }).end(); return; }
  const file = join(root, path.endsWith('/') ? path + 'index.html' : path);
  if (!['demo', 'src', 'site'].some((d) => file.startsWith(join(root, d)))) { res.writeHead(404).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream',
      'content-security-policy': "default-src 'self'; connect-src 'none'; form-action 'none'" }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(port, '127.0.0.1', () => console.log(`open-healthspan: site http://127.0.0.1:${port}/site/  demo http://127.0.0.1:${port}/demo/`));
