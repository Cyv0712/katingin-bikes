// Smaller copies of uploaded photos, made on demand.
//
//   GET /uploads/<file>?w=480   ->   the photo at 480px wide (WebP)
//
// Uploads are stored once at up to 1200px. A bike card shows a ~300px box, so
// serving the original there wastes most of the download. The frontend asks for
// ?w=240|480|800 through srcset (frontend/src/utils/format.js, imageProps).
//
// Nothing is migrated: the first request for a size creates it, later ones are
// served from the cache directory. The cache can be deleted at any time (it is
// rebuilt on demand), so it does not need persistent storage. A request without
// ?w=, with a width that is not allowed, or for a file that cannot be resized
// falls through to the original file, exactly as before.
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Only these widths, so the cache is bounded: (number of photos) x 3
const WIDTHS = [240, 480, 800];
// One flat file name: no directories, so nothing can point outside the uploads folder
const NAME_RE = /^[A-Za-z0-9._-]+$/;

const DEFAULT_CACHE_DIR = path.join(__dirname, '..', 'cache', 'variants');

const variantPath = (cacheDir, width, name) => path.join(cacheDir, String(width), `${name}.webp`);

function createVariantMiddleware({ uploadDir, cacheDir = DEFAULT_CACHE_DIR }) {
  const root = path.resolve(uploadDir);
  const inflight = new Map(); // cache file -> promise, so concurrent requests resize once

  async function build(source, target, width) {
    // Read into memory first: keeps no file handle open on the original
    const input = fs.readFileSync(source);
    const output = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    fs.mkdirSync(path.dirname(target), { recursive: true });
    // Write then rename, so a request never reads a half-written file
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, output);
    fs.renameSync(tmp, target);
  }

  return async function variantMiddleware(req, res, next) {
    try {
      if (req.method !== 'GET' || req.query.w === undefined) return next();

      const width = Number(req.query.w);
      const name = decodeURIComponent(req.path.slice(1));
      if (!WIDTHS.includes(width) || !NAME_RE.test(name) || name.startsWith('.')) return next();

      const source = path.join(root, name);
      if (path.dirname(source) !== root || !fs.existsSync(source) || !fs.statSync(source).isFile()) return next();

      const target = variantPath(cacheDir, width, name);
      if (!fs.existsSync(target)) {
        if (!inflight.has(target)) {
          inflight.set(target, build(source, target, width).finally(() => inflight.delete(target)));
        }
        await inflight.get(target);
      }

      // Same long-lived caching as the originals: file names are unique per upload
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(path.resolve(target), (err) => {
        if (err && !res.headersSent) next();
      });
    } catch (err) {
      console.error(`[image-variants] could not resize (${err.message}); serving the original`);
      return next();
    }
  };
}

/** Delete the resized copies of one upload (call when the original is deleted). */
function removeVariants(name, cacheDir = DEFAULT_CACHE_DIR) {
  if (typeof name !== 'string' || !NAME_RE.test(name)) return;
  for (const width of WIDTHS) {
    try {
      fs.unlinkSync(variantPath(cacheDir, width, name));
    } catch {
      // not generated, or already gone
    }
  }
}

module.exports = { createVariantMiddleware, removeVariants, WIDTHS, DEFAULT_CACHE_DIR };
