// Custom events for the self-hosted Umami (loaded in index.html, skipped on /insights).
// A no-op when the script is blocked or hasn't loaded, so callers never need to check.
export const track = (name, data) => {
  try {
    window.umami?.track(name, data);
  } catch {
    // analytics must never break the page
  }
};
