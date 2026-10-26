// Optional dependency-free preview. The site also works by opening index.html.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { promisify } = require('node:util');
const { pipeline } = require('node:stream');
const gzip = promisify(zlib.gzip);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.svg', '.json', '.md', '.txt', '.xml', '.csv']);

function quality(header, encoding) {
  const values = new Map(String(header || '').toLowerCase().split(',').map(part => {
    const [name, ...params] = part.trim().split(';');
    const parameter = params.map(p => p.trim()).find(p => p.startsWith('q='));
    const q = parameter === undefined ? 1 : Number(parameter.slice(2));
    return [name, Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0];
  }));
  if (values.has(encoding)) return values.get(encoding);
  if (encoding === 'identity') return values.get('*') === 0 ? 0 : 1;
  return values.get('*') || 0;
}
function etag(body, encoding) {
  return '"' + crypto.createHash('sha256').update(body).digest('base64url').slice(0, 27) + '-' + encoding + '"';
}
function matchesTag(header, tag) {
  return String(header || '').split(',').some(value => {
    value = value.trim();
    return value === '*' || value.replace(/^W\//, '') === tag.replace(/^W\//, '');
  });
}
function createServer(options = {}) {
  const root = fs.realpathSync(options.root || __dirname);
  const cacheLimitBytes = Math.max(0, options.cacheLimitBytes ?? 8 * 1024 * 1024);
  const maxEntryBytes = Math.max(0, options.maxEntryBytes ?? 4 * 1024 * 1024);
  const cache = new Map(), pending = new Map();
  let cacheBytes = 0;
  const inside = file => file === root || file.startsWith(root + path.sep);
  function remove(key) {
    const entry = cache.get(key);
    if (entry) { cacheBytes -= entry.bytes; cache.delete(key); }
  }
  function remember(file, entry) {
    remove(file);
    if (entry.bytes > cacheLimitBytes) return;
    while (cacheBytes + entry.bytes > cacheLimitBytes && cache.size) remove(cache.keys().next().value);
    cache.set(file, entry); cacheBytes += entry.bytes;
  }
  async function representation(file, signature, compressible) {
    const cached = cache.get(file);
    if (cached && cached.signature === signature) {
      cache.delete(file); cache.set(file, cached); // least-recently-used eviction
      return cached;
    }
    if (cached) remove(file);
    const key = file + '\0' + signature;
    if (!pending.has(key)) pending.set(key, (async () => {
      const body = await fs.promises.readFile(file);
      const compressed = compressible ? await gzip(body) : null;
      const entry = {signature, body, compressed, bytes: body.length + (compressed?.length || 0),
        identityTag: etag(body, 'identity'), gzipTag: compressed ? etag(compressed, 'gzip') : null};
      remember(file, entry);
      return entry;
    })().finally(() => pending.delete(key)));
    return pending.get(key);
  }
  function error(req, res, status, message, extra = {}) {
    const body = Buffer.from(message + '\n');
    res.writeHead(status, {'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': body.length,
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra});
    res.end(req.method === 'HEAD' ? undefined : body);
  }
  const server = http.createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) return error(req, res, 405, 'Method not allowed', {Allow: 'GET, HEAD'});
    let pathname;
    try {
      if (!req.url.startsWith('/')) throw new Error('Invalid request target');
      pathname = decodeURIComponent(req.url.split('?')[0]);
      if (pathname.includes('\0') || pathname.includes('\\')) throw new Error('Invalid path');
    } catch { return error(req, res, 400, 'Bad request'); }
    if (pathname.split('/').includes('..')) return error(req, res, 403, 'Forbidden');
    const candidate = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!inside(candidate)) return error(req, res, 403, 'Forbidden');
    try {
      // A symlink inside the site must not expose files outside its root.
      const file = await fs.promises.realpath(candidate);
      if (!inside(file)) return error(req, res, 403, 'Forbidden');
      const stat = await fs.promises.stat(file, {bigint: true});
      if (!stat.isFile()) return error(req, res, 404, 'Not found');
      const extension = path.extname(file).toLowerCase(), compressible = COMPRESSIBLE.has(extension);
      const useGzip = compressible && quality(req.headers['accept-encoding'], 'gzip') > 0;
      if (!useGzip && quality(req.headers['accept-encoding'], 'identity') === 0) return error(req, res, 406, 'No acceptable representation');
      const encoding = useGzip ? 'gzip' : 'identity';
      const signature = [stat.dev, stat.ino, stat.size, stat.mtimeNs, stat.ctimeNs].join('-');
      const small = stat.size <= BigInt(maxEntryBytes);
      let body, tag;
      if (small) {
        const entry = await representation(file, signature, compressible);
        body = useGzip ? entry.compressed : entry.body;
        tag = useGzip ? entry.gzipTag : entry.identityTag;
      } else {
        // Large files stream instead of occupying the in-memory body cache.
        tag = 'W/"' + crypto.createHash('sha256').update(signature).digest('base64url').slice(0, 27) + '-' + encoding + '"';
      }
      const headers = {'Content-Type': TYPES[extension] || 'application/octet-stream',
        'Cache-Control': 'no-cache', ETag: tag, 'Last-Modified': new Date(Number(stat.mtimeMs)).toUTCString(),
        'X-Content-Type-Options': 'nosniff'};
      if (compressible) headers.Vary = 'Accept-Encoding';
      if (useGzip) headers['Content-Encoding'] = 'gzip';
      if (matchesTag(req.headers['if-none-match'], tag)) { res.writeHead(304, headers); return res.end(); }
      if (body) headers['Content-Length'] = body.length;
      else if (!useGzip) headers['Content-Length'] = String(stat.size);
      res.writeHead(200, headers);
      if (req.method === 'HEAD') return res.end();
      if (body) return res.end(body);
      const source = fs.createReadStream(file);
      const onError = err => { if (err && !res.destroyed) res.destroy(err); };
      if (useGzip) pipeline(source, zlib.createGzip(), res, onError);
      else pipeline(source, res, onError);
    } catch (err) {
      if (res.headersSent) return res.destroy();
      const status = ['ENOENT', 'ENOTDIR'].includes(err.code) ? 404 : ['EACCES', 'EPERM'].includes(err.code) ? 403 : 500;
      error(req, res, status, status === 404 ? 'Not found' : status === 403 ? 'Forbidden' : 'Could not read this file');
    }
  });
  server.cacheInfo = () => ({bytes: cacheBytes, entries: cache.size, limit: cacheLimitBytes});
  server.on('close', () => {cache.clear(); pending.clear(); cacheBytes = 0;});
  return server;
}
module.exports = {createServer};
if (require.main === module) {
  const port = Number(process.env.PORT) || 4173;
  const server = createServer();
  server.on('error', err => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${port} is in use. Close the other preview or set PORT to another port.` : err.message);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`Recipe Finder: http://127.0.0.1:${server.address().port}\nPress Ctrl+C to stop.`));
}
