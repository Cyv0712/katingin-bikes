// Run with: npm test  (no database needed)
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { scheduleFrontendRebuild, cancelScheduledRebuild, triggerRebuild } = require('../utils/frontendRebuild');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const URL_ = 'https://coolify.test/api/v1/deploy?uuid=abc';

describe('scheduleFrontendRebuild', () => {
  afterEach(() => {
    cancelScheduledRebuild();
    delete process.env.FRONTEND_DEPLOY_WEBHOOK_URL;
  });

  it('does nothing when no webhook URL is configured', async () => {
    delete process.env.FRONTEND_DEPLOY_WEBHOOK_URL;
    const calls = [];
    assert.equal(scheduleFrontendRebuild({ delayMs: 5, fetchImpl: async (...a) => { calls.push(a); return { ok: true }; } }), false);
    await sleep(40);
    assert.equal(calls.length, 0);
  });

  it('batches several changes into one request, with the bearer token', async () => {
    const calls = [];
    const fetchImpl = async (url, init) => { calls.push({ url, init }); return { ok: true }; };
    assert.equal(scheduleFrontendRebuild({ url: URL_, token: 'tok', delayMs: 20, fetchImpl }), true);
    // later changes inside the window ride along and do not restart the timer
    assert.equal(scheduleFrontendRebuild({ url: URL_, token: 'tok', delayMs: 20, fetchImpl }), false);
    assert.equal(scheduleFrontendRebuild({ url: URL_, token: 'tok', delayMs: 20, fetchImpl }), false);
    await sleep(80);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, URL_);
    assert.equal(calls[0].init.headers.Authorization, 'Bearer tok');
  });

  it('can schedule again once the batch has fired', async () => {
    let count = 0;
    const fetchImpl = async () => { count += 1; return { ok: true }; };
    scheduleFrontendRebuild({ url: URL_, delayMs: 10, fetchImpl });
    await sleep(60);
    assert.equal(scheduleFrontendRebuild({ url: URL_, delayMs: 10, fetchImpl }), true);
    await sleep(60);
    assert.equal(count, 2);
  });

  it('reads the URL and delay from the environment', async () => {
    process.env.FRONTEND_DEPLOY_WEBHOOK_URL = URL_;
    const calls = [];
    assert.equal(scheduleFrontendRebuild({ delayMs: 5, fetchImpl: async (u) => { calls.push(u); return { ok: true }; } }), true);
    await sleep(40);
    assert.deepEqual(calls, [URL_]);
  });
});

describe('triggerRebuild', () => {
  it('sends no Authorization header without a token', async () => {
    let init;
    await triggerRebuild({ url: URL_, fetchImpl: async (u, i) => { init = i; return { ok: true }; } });
    assert.deepEqual(init.headers, {});
  });

  it('reports failure but never throws, and does not log the URL or token', async () => {
    const logged = [];
    const origError = console.error;
    console.error = (...a) => logged.push(a.join(' '));
    try {
      assert.equal(await triggerRebuild({ url: URL_, token: 'secret-token', fetchImpl: async () => ({ ok: false, status: 503 }) }), false);
      assert.equal(await triggerRebuild({ url: URL_, token: 'secret-token', fetchImpl: async () => { throw new Error(`boom ${URL_} secret-token`); } }), false);
    } finally {
      console.error = origError;
    }
    assert.equal(logged.length, 2);
    for (const line of logged) {
      assert.ok(!line.includes('secret-token'), line);
      assert.ok(!line.includes('coolify.test'), line);
    }
  });
});
