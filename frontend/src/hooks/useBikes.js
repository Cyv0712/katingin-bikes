import { useEffect, useState } from 'react';
import { apiUrl } from '../config/api';

// One shared fetch of the full inventory. Home, Inventory, Bike detail
// ("More bikes") and the Footer all read from it, so a page load makes a
// single /api/bikes request instead of one per component.
const TTL_MS = 60 * 1000;

let cache = null; // { at, bikes }
let inflight = null;

const isAvailable = (bike) => bike.status === 'Available' || !bike.status;

// The cached list if it is still fresh, else null
const freshCache = () => (cache && Date.now() - cache.at < TTL_MS ? cache.bikes : null);

const load = () => {
  const fresh = freshCache();
  if (fresh) return Promise.resolve(fresh);
  if (inflight) return inflight;

  inflight = fetch(apiUrl('/api/bikes'))
    .then((res) => res.json())
    .then((data) => {
      // The backend can return an error object instead of an array
      if (!Array.isArray(data)) {
        throw new Error('Expected an array of bikes');
      }
      const bikes = data.filter(isAvailable);
      cache = { at: Date.now(), bikes };
      return bikes;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
};

/**
 * Start (or join) the shared inventory fetch ahead of time, e.g. from the
 * splash screen. Never rejects: resolves to [] on failure, and the pages
 * report the error themselves through useBikes.
 */
export const preloadBikes = () => load().catch(() => []);

/**
 * Available bikes only (Sold units are hidden everywhere on the public site).
 * `loading` is true until the first response (or failure) arrives.
 */
const useBikes = () => {
  const [state, setState] = useState(() => {
    const cached = freshCache();
    return { bikes: cached || [], loading: !cached, error: null };
  });

  useEffect(() => {
    let active = true;
    load()
      .then((bikes) => {
        if (active) setState({ bikes, loading: false, error: null });
      })
      .catch((error) => {
        console.error('Failed to load bikes:', error);
        if (active) setState({ bikes: [], loading: false, error });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
};

export default useBikes;
