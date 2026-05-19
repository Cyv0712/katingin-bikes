import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { brandConfig } from '../data/brandConfig';

/**
 * SplashScreen — GSAP-powered cinematic intro.
 *
 * Sequence:
 *  1. Logo fades in on a dark screen
 *  2. "KATINGIN BIKES" text slides up
 *  3. Tagline fades in
 *  4. Hero image expands from a tiny point outward to fill the viewport
 *  5. Everything dissolves into the live site
 */
const SplashScreen = ({ onComplete }) => {
  const containerRef = useRef(null);
  const imgWrapRef = useRef(null);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const titleMainRef = useRef(null);
  const titleAccentRef = useRef(null);
  const taglineRef = useRef(null);
  const contentRef = useRef(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Preload the hero image
    const preload = new Image();
    preload.fetchPriority = 'high';
    preload.src = brandConfig.images.heroBackground;

    let active = true;
    const ctx = gsap.context(() => {}, containerRef); // Scopes selectors to containerRef

    const runAnimation = () => {
      if (!active) return;
      ctx.add(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            setRemoved(true);
            onComplete();
          },
        });

        // ── Phase 1: Logo fades in ──
        tl.fromTo(logoRef.current,
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.4)' }
        );

        // ── Phase 2: "KATINGIN" slides up ──
        tl.fromTo(titleMainRef.current,
          { y: '120%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.8, ease: 'power4.out' },
          '-=0.3'
        );

        // ── Phase 3: "BIKES" slides up (staggered) ──
        tl.fromTo(titleAccentRef.current,
          { y: '120%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.8, ease: 'power4.out' },
          '-=0.5'
        );

        // ── Phase 4: Tagline fades in ──
        tl.fromTo(taglineRef.current,
          { opacity: 0, y: 12 },
          { opacity: 0.7, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        );

        // ── Phase 5: Hold on logo/text ──
        tl.to({}, { duration: 0.6 });

        // ── Phase 6: Hero image expands from center ──
        tl.set(imgWrapRef.current, { width: '0px', height: '0px', borderRadius: '50%', opacity: 1 });

        // Fade out the text content as the image takes over
        tl.to(contentRef.current, {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: 'power2.in',
        });

        // Expand the image from center
        tl.to(imgWrapRef.current, {
          width: '120vw',
          height: '120vh',
          borderRadius: '0px',
          duration: 1.4,
          ease: 'power3.inOut',
        }, '-=0.3');

        // Darken overlay
        tl.to(overlayRef.current, {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        }, '-=0.6');

        // ── Phase 7: Dissolve everything ──
        tl.to(containerRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
        });
      });
    };

    if (preload.complete) {
      requestAnimationFrame(runAnimation);
    } else {
      preload.onload = () => requestAnimationFrame(runAnimation);
      preload.onerror = () => requestAnimationFrame(runAnimation);
    }

    return () => {
      active = false;
      ctx.revert(); // clean up all GSAP timelines/tweens
    };
  }, [onComplete]);

  if (removed) return null;

  return (
    <div ref={containerRef} className="splash-screen">
      {/* Hero image — expands from center outward */}
      <div ref={imgWrapRef} className="splash-img-wrap">
        <img
          src={brandConfig.images.heroBackground}
          alt=""
          className="splash-img"
          fetchPriority="high"
        />
      </div>

      {/* Dark overlay */}
      <div ref={overlayRef} className="splash-overlay" />

      {/* Logo + Text — shown first, fades out when image expands */}
      <div ref={contentRef} className="splash-content">
        <img
          ref={logoRef}
          src="/static_data/Katingin_logo.webp"
          alt="Katingin Bikes"
          className="splash-logo"
        />
        <div className="splash-title">
          <span ref={titleMainRef} className="splash-title-main">KATINGIN</span>
          <span ref={titleAccentRef} className="splash-title-accent">BIKES</span>
        </div>
        <div ref={taglineRef} className="splash-tagline">ANG TOY KINGDOM NG MGA TITO</div>
      </div>
    </div>
  );
};

export default SplashScreen;
