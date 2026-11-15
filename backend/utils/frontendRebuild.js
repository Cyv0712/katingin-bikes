// The public site is prerendered at build time (frontend/scripts/prerender.js),
// so its bike pages and sitemap only change when the frontend is rebuilt. When
// inventory changes, ask the deploy platform (Coolify) to rebuild it.
//
// Off unless FRONTEND_DEPLOY_WEBHOOK_URL is set, so local and test runs never
// call out. Changes are batched: the first change starts a timer, later changes
// inside the window ride along (the build reads the inventory when it runs),
// and the timer is never pushed back, so a long editing session still deploys.
//
//   FRONTEND_DEPLOY_WEBHOOK_URL    Coolify deploy URL, e.g.
//                                  https://coolify.example.com/api/v1/deploy?uuid=<frontend app uuid>
//   FRONTEND_DEPLOY_WEBHOOK_TOKEN  Coolify API token, sent as a Bearer token (optional)
//   FRONTEND_REBUILD_DELAY_MS      batching window, default 120000 (2 minutes)

const DEFAULT_DELAY_MS = 2 * 60 * 1000;

let timer = null;

// Best-effort: never throws, and never logs the URL or token.
async function triggerRebuild({ url, token, fetchImpl = fetch }) {
  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error(`[frontend-rebuild] deploy webhook answered HTTP ${res.status}`);
      return false;
    }
    console.log('[frontend-rebuild] frontend rebuild requested');
    return true;
  } catch (err) {
    console.error(`[frontend-rebuild] deploy webhook failed: ${err.name}`);
    return false;
  }
}

/** Call after any change visitors can see (add, edit, reserve, sold, delete). */
function scheduleFrontendRebuild(options = {}) {
  const url = options.url ?? process.env.FRONTEND_DEPLOY_WEBHOOK_URL;
  if (!url || timer) return false;

  const token = options.token ?? process.env.FRONTEND_DEPLOY_WEBHOOK_TOKEN;
  const parsed = Number(options.delayMs ?? process.env.FRONTEND_REBUILD_DELAY_MS);
  const delayMs = Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_DELAY_MS;

  timer = setTimeout(() => {
    timer = null;
    triggerRebuild({ url, token, fetchImpl: options.fetchImpl });
  }, delayMs);
  timer.unref(); // never keep the process (or a test run) alive for this
  return true;
}

// For tests
function cancelScheduledRebuild() {
  clearTimeout(timer);
  timer = null;
}

module.exports = { scheduleFrontendRebuild, cancelScheduledRebuild, triggerRebuild };
