import { useEffect, useRef } from 'react';
import { brandConfig } from '../data/brandConfig';
import { preloadBikes } from '../hooks/useBikes';
import { getBikeImage } from '../utils/format';
import { pickHomeBikes } from '../utils/homeBikes';

/**
 * SplashScreen — intro that doubles as a real loading screen.
 *
 * The whole app (nav, Home, footer) is already rendered underneath it. The
 * splash only lifts once Home has what it needs: its code, the inventory
 * response, and the hero + featured bike images.
 *
 * Phases (data-phase on the root, all visuals live in index.css):
 *   intro   logo pops in, wordmark rises letter by letter, ring tracks real
 *           loading progress
 *   reveal  content falls away and a circular hole opens in the splash from
 *           the centre, showing the live homepage; then onComplete fires
 *
 * Why it is built this way:
 *  - Visuals are CSS transitions/keyframes only (transform, opacity, a mask
 *    radius), so there is no per-frame layout like the old width/height tween.
 *  - Nothing depends on requestAnimationFrame. Phase changes are driven by
 *    setTimeout, which keeps firing in background tabs (throttled to ~1s at
 *    worst), and CSS animations are wall-clock based, so a user who tabs away
 *    comes back to a finished splash instead of a frozen one.
 */

const RING_RADIUS = 56;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Durations must match the transitions in index.css.
const TIMING = {
  full: { minIntro: 1700, settle: 450, reveal: 1300 },
  reduced: { minIntro: 500, settle: 200, reveal: 350 },
};

// Never let a slow network (or a cold backend) hold the visitor on the splash.
const MAX_LOAD_WAIT = 8000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = resolve; // a failed image must not block the splash
    img.src = src;
    if (img.complete) resolve();
  });

// Inventory response first, then the images Home will actually render
const loadHomeBikes = () =>
  preloadBikes().then((bikes) => {
    const { heroBikes, featuredBikes } = pickHomeBikes(bikes);
    return Promise.all([...heroBikes, ...featuredBikes].map((bike) => loadImage(getBikeImage(bike))));
  });

const Word = ({ text, startIndex, className }) => (
  <span className={`splash-word ${className}`} aria-hidden="true">
    {[...text].map((char, i) => (
      <span key={i} className="splash-char" style={{ '--i': startIndex + i }}>
        {char}
      </span>
    ))}
  </span>
);

const SplashScreen = ({ onComplete }) => {
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    if (!root || !ring) return undefined;

    const timing = reduceMotion() ? TIMING.reduced : TIMING.full;
    const timers = new Set();
    let cancelled = false;

    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        if (!cancelled) fn();
      }, ms);
      timers.add(id);
    };

    const setProgress = (p) => {
      ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - p));
    };

    // ── Real loading work ──
    const tasks = [
      loadImage(brandConfig.images.heroBackground),
      loadImage('/static_data/Katingin_logo.webp'),
      // Wordmark font, so letters never swap mid-animation
      document.fonts?.load('800 1em "Sofia Sans Extra Condensed"').catch(() => {}),
      // Home's code, so no spinner shows when the splash lifts
      import('../pages/Home').catch(() => {}),
      // Inventory data + the bike photos Home shows
      loadHomeBikes(),
    ];

    let finished = 0;
    // Start the ring moving straight away; real progress takes over from here.
    setProgress(0.12);
    const tracked = tasks.map((task) =>
      Promise.resolve(task).finally(() => {
        finished += 1;
        if (!cancelled) setProgress(Math.max(0.12, finished / tasks.length));
      }),
    );

    const loaded = Promise.race([Promise.all(tracked), wait(MAX_LOAD_WAIT)]);

    Promise.all([loaded, wait(timing.minIntro)]).then(() => {
      if (cancelled) return;
      setProgress(1);

      // Schedule the remaining phases up front: fewer timer hops means less
      // throttling drift if the tab is in the background. The settle gap lets
      // React paint the freshly loaded data underneath before the hole opens.
      later(() => { root.dataset.phase = 'reveal'; }, timing.settle);
      later(() => onCompleteRef.current?.(), timing.settle + timing.reveal);
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <div ref={rootRef} className="splash" data-phase="intro" role="status" aria-live="polite">
      <span className="visually-hidden">Loading Katingin Bikes</span>

      <div className="splash-content" aria-hidden="true">
        <div className="splash-mark">
          <svg className="splash-ring" viewBox="0 0 120 120">
            <circle className="splash-ring-track" cx="60" cy="60" r={RING_RADIUS} />
            <circle
              ref={ringRef}
              className="splash-ring-fill"
              cx="60"
              cy="60"
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE}
            />
          </svg>
          <img
            src="/static_data/Katingin_logo.webp"
            alt=""
            className="splash-logo"
            decoding="async"
          />
        </div>

        <div className="splash-title">
          <Word text="Katingin" startIndex={0} className="splash-word-main" />
          <Word text="Bikes" startIndex={8} className="splash-word-accent" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
