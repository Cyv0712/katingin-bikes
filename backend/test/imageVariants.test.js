// Run with: npm test  (no database needed)
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const express = require('express');
const sharp = require('sharp');
const { createVariantMiddleware, removeVariants, WIDTHS } = require('../utils/imageVariants');

let tmp, uploadDir, cacheDir, server, base;
let big; // original bytes of a 1200x900 photo

const get = (url, init) => fetch(`${base}${url}`, init);
const widthOf = async (res) => (await sharp(Buffer.from(await res.arrayBuffer())).metadata()).width;
const cacheFile = (w, name) => path.join(cacheDir, String(w), `${name}.webp`);

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-variants-'));
  uploadDir = path.join(tmp, 'uploads');
  cacheDir = path.join(tmp, 'cache');
  fs.mkdirSync(uploadDir);

  // A photo with some detail so resizing visibly changes the size
  const raw = Buffer.alloc(1200 * 900 * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = (i * 31 + (i >> 9) * 17) & 255;
  big = await sharp(raw, { raw: { width: 1200, height: 900, channels: 3 } }).webp({ quality: 80 }).toBuffer();
  fs.writeFileSync(path.join(uploadDir, 'big.webp'), big);
  fs.writeFileSync(path.join(uploadDir, 'small.webp'),
    await sharp(raw, { raw: { width: 1200, height: 900, channels: 3 } }).resize(400).webp().toBuffer());
  fs.writeFileSync(path.join(uploadDir, 'legacy.jpg'),
    await sharp(raw, { raw: { width: 1200, height: 900, channels: 3 } }).jpeg().toBuffer());
  fs.writeFileSync(path.join(uploadDir, 'garbage.webp'), Buffer.from('this is not an image'));
  fs.writeFileSync(path.join(tmp, 'secret.txt'), 'top secret'); // outside uploads
  fs.writeFileSync(path.join(tmp, 'outside.webp'), big); // a real, resizable image outside uploads
  fs.writeFileSync(path.join(uploadDir, '.hidden.webp'), big);

  const app = express();
  app.use('/uploads', createVariantMiddleware({ uploadDir, cacheDir }));
  app.use('/uploads', express.static(uploadDir));
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('GET /uploads/<file>?w=', () => {
  it('serves a smaller WebP copy with long-lived caching, and keeps it on disk', async () => {
    const res = await get('/uploads/big.webp?w=480');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/webp');
    assert.match(res.headers.get('cache-control'), /immutable/);
    const bytes = Buffer.from(await res.arrayBuffer());
    assert.equal((await sharp(bytes).metadata()).width, 480);
    assert.ok(bytes.length < big.length / 2, `variant ${bytes.length}B should be well under the original ${big.length}B`);
    assert.ok(fs.existsSync(cacheFile(480, 'big.webp')));
  });

  it('serves repeat requests from the cache without regenerating', async () => {
    await get('/uploads/big.webp?w=240');
    const before = fs.statSync(cacheFile(240, 'big.webp')).mtimeMs;
    await new Promise((r) => setTimeout(r, 30));
    const res = await get('/uploads/big.webp?w=240');
    assert.equal(res.status, 200);
    assert.equal(await widthOf(res), 240);
    assert.equal(fs.statSync(cacheFile(240, 'big.webp')).mtimeMs, before);
  });

  it('supports every allowed width, and nothing else', async () => {
    for (const w of WIDTHS) {
      const res = await get(`/uploads/big.webp?w=${w}`);
      assert.equal(await widthOf(res), w);
    }
    for (const bad of ['123', '0', '-480', '99999', 'abc', '480.5', '', '480&w=240', '1e3']) {
      const res = await get(`/uploads/big.webp?w=${bad}`);
      assert.equal(res.status, 200, bad);
      assert.equal(await widthOf(res), 1200, `?w=${bad} must give the untouched original`);
    }
    assert.equal(fs.readdirSync(cacheDir).sort().join(), '240,480,800', 'only the allowed widths exist in the cache');
  });

  it('serves the untouched original when no width is asked for', async () => {
    const res = await get('/uploads/big.webp');
    assert.equal(res.status, 200);
    assert.deepEqual(Buffer.from(await res.arrayBuffer()), big);
  });

  it('never enlarges a photo that is already smaller', async () => {
    const res = await get('/uploads/small.webp?w=800');
    assert.equal(await widthOf(res), 400);
  });

  it('resizes legacy non-WebP uploads too, as WebP', async () => {
    const res = await get('/uploads/legacy.jpg?w=480');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/webp');
    assert.equal(await widthOf(res), 480);
  });

  it('creates a variant once when many requests arrive together', async () => {
    const responses = await Promise.all(Array.from({ length: 8 }, () => get('/uploads/small.webp?w=240')));
    for (const r of responses) {
      assert.equal(r.status, 200);
      assert.equal(await widthOf(r), 240);
    }
    assert.deepEqual(fs.readdirSync(path.join(cacheDir, '240')).filter((f) => f.startsWith('small')), ['small.webp.webp']);
  });

  it('falls back to the original when the file cannot be resized', async () => {
    const res = await get('/uploads/garbage.webp?w=480');
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'this is not an image');
    assert.ok(!fs.existsSync(cacheFile(480, 'garbage.webp')));
  });

  it('cannot be pointed outside the uploads folder', async () => {
    // outside.webp is a real image next to the uploads folder: if the name checks failed it WOULD be resized
    const attempts = [
      '/uploads/..%2Foutside.webp?w=480',
      '/uploads/%2e%2e%2foutside.webp?w=480',
      '/uploads/..%5Coutside.webp?w=480',
      '/uploads/sub%2F..%2F..%2Foutside.webp?w=480',
      '/uploads/..%2Fsecret.txt?w=480',
      '/uploads/%00big.webp?w=480',
      '/uploads/.hidden.webp?w=480',
      '/uploads/%ZZ?w=480', // malformed escape
    ];
    for (const url of attempts) {
      const res = await get(url);
      const body = Buffer.from(await res.arrayBuffer());
      assert.ok(!body.toString('latin1').includes('top secret'), `${url} leaked a file`);
      assert.notEqual(res.headers.get('content-type'), 'image/webp', `${url} must not be served as an image`);
      assert.notEqual(res.status, 200, `${url} must not succeed`);
    }
    const created = fs.readdirSync(cacheDir).flatMap((w) => fs.readdirSync(path.join(cacheDir, w)));
    assert.ok(!created.some((f) => f.includes('outside') || f.includes('secret') || f.includes('hidden')), `unexpected cache files: ${created}`);
  });

  it('gives a 404 for a photo that does not exist', async () => {
    assert.equal((await get('/uploads/nope.webp?w=480')).status, 404);
    assert.equal((await get('/uploads/nope.webp')).status, 404);
  });
});

describe('removeVariants', () => {
  it('deletes every resized copy of a photo, and tolerates ones that were never made', async () => {
    for (const w of WIDTHS) await get(`/uploads/big.webp?w=${w}`);
    for (const w of WIDTHS) assert.ok(fs.existsSync(cacheFile(w, 'big.webp')));
    removeVariants('big.webp', cacheDir);
    for (const w of WIDTHS) assert.ok(!fs.existsSync(cacheFile(w, 'big.webp')));
    assert.doesNotThrow(() => removeVariants('never-existed.webp', cacheDir));
    assert.doesNotThrow(() => removeVariants('../escape', cacheDir));
    assert.doesNotThrow(() => removeVariants(null, cacheDir));
  });
});
