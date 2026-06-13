const https = require('https');

/**
 * Downloads a file from a URL using Node's core https module.
 * This respects dns.setDefaultResultOrder('ipv4first') and avoids undici/fetch timeout bugs in container environments.
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Server responded with status code: ${res.statusCode}`));
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    request.on('error', (err) => reject(err));
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Connection timeout trying to download image'));
    });
  });
}

module.exports = { downloadImage };
