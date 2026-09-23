import '@/styles/globals.css';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

/* Chatbot is client-only (uses browser APIs) — load with no SSR */
const Chatbot = dynamic(() => import('../components/Chatbot'), { ssr: false });

/* ── Preloader ────────────────────────────────────────────────────────────
   Mounts only on the homepage. Starts fully visible (covers page) and
   dismisses itself after the ~1.6 s animation. A 2.5 s hard timeout
   guarantees it can never block the page indefinitely.
   ──────────────────────────────────────────────────────────────────────── */
function Preloader() {
  const overlayRef   = useRef(null);
  const fillRef      = useRef(null);
  const counterRef   = useRef(null);
  const wipePanelRef = useRef(null);
  const wordmarkRef  = useRef(null);

  useEffect(() => {
    const WORD         = 'JOSEPHDELIVERY';
    const SPLIT_AT     = 6;
    const LETTER_DELAY = 60;
    const ARROW_DELAY  = SPLIT_AT * LETTER_DELAY + 40;
    const DURATION     = 1600;
    const COLOR_A      = '#f4f5f7';
    const COLOR_B      = '#c0392b';

    const reduced  = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const overlay  = overlayRef.current;
    const fill     = fillRef.current;
    const counter  = counterRef.current;
    const wipe     = wipePanelRef.current;
    const wordmark = wordmarkRef.current;

    if (!overlay) return;

    /* Hard safety — overlay gone within 2.5 s no matter what */
    const safetyTimer = setTimeout(dismiss, 2500);

    function dismiss() {
      clearTimeout(safetyTimer);
      if (overlay) overlay.style.display = 'none';
    }

    /* ── Build wordmark ──────────────────────────────────────── */
    wordmark.innerHTML = '';
    for (let i = 0; i < WORD.length; i++) {
      if (i === SPLIT_AT) {
        const wrap = document.createElement('span');
        wrap.id = 'pl-arrow-wrap';
        wrap.style.cssText = 'display:inline-flex;align-items:center;margin:0 clamp(4px,1vw,12px);position:relative;top:0.04em;';
        wrap.innerHTML = '<svg id="pl-arrow" viewBox="0 0 38 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:clamp(18px,3.5vw,36px);height:auto;clip-path:inset(0 100% 0 0);animation:plArrowReveal 0.3s cubic-bezier(0.22,1,0.36,1) forwards;animation-play-state:paused;"><path d="M0 9H34M34 9L26 1M34 9L26 17" stroke="#c0392b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        wordmark.appendChild(wrap);
      }
      const span = document.createElement('span');
      span.textContent = WORD[i];
      span.style.cssText = [
        'display:inline-block',
        'font-size:clamp(28px,7vw,72px)',
        'font-weight:900',
        'letter-spacing:-0.05em',
        'text-transform:uppercase',
        'color:' + (i < SPLIT_AT ? COLOR_A : COLOR_B),
        'opacity:0',
        'transform:translateY(40px)',
        'animation:plLetterRise 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        'animation-delay:' + (reduced ? 0 : i * LETTER_DELAY) + 'ms',
      ].join(';');
      wordmark.appendChild(span);
    }

    /* ── Arrow reveal ────────────────────────────────────────── */
    if (reduced) {
      const svg = document.getElementById('pl-arrow');
      if (svg) { svg.style.clipPath = 'inset(0 0% 0 0)'; svg.style.animation = 'none'; }
    } else {
      setTimeout(() => {
        const svg = document.getElementById('pl-arrow');
        if (svg) svg.style.animationPlayState = 'running';
      }, ARROW_DELAY);
    }

    /* ── Progress counter ────────────────────────────────────── */
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    if (reduced) {
      if (fill)    fill.style.width = '100%';
      if (counter) counter.textContent = '100';
      dismiss();
      return;
    }

    let start = null;
    function frame(ts) {
      if (!start) start = ts;
      const raw   = Math.min((ts - start) / DURATION, 1);
      const eased = easeOutCubic(raw);
      if (fill)    fill.style.width = (eased * 100) + '%';
      if (counter) counter.textContent = String(Math.floor(eased * 100)).padStart(3, '0');
      if (raw < 1) {
        requestAnimationFrame(frame);
      } else {
        if (fill)    fill.style.width = '100%';
        if (counter) counter.textContent = '100';
        runExit();
      }
    }
    requestAnimationFrame(frame);

    /* ── Exit sequence ───────────────────────────────────────── */
    function runExit() {
      const arrowEl = document.getElementById('pl-arrow');
      if (arrowEl) arrowEl.style.animation = 'plArrowShoot 0.35s cubic-bezier(0.4,0,1,1) forwards';
      setTimeout(() => {
        if (!wipe) { dismiss(); return; }
        wipe.style.animation = 'plWipeSweep 0.55s cubic-bezier(0.76,0,0.24,1) forwards';
        const endTimer = setTimeout(dismiss, 700);
        wipe.addEventListener('animationend', () => { clearTimeout(endTimer); dismiss(); }, { once: true });
      }, 80);
    }

    return () => { clearTimeout(safetyTimer); dismiss(); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes plLetterRise  { to { opacity:1; transform:translateY(0) } }
        @keyframes plArrowReveal { to { clip-path:inset(0 0% 0 0) } }
        @keyframes plArrowShoot  { from { transform:translateX(0) } to { transform:translateX(120vw) } }
        @keyframes plWipeSweep   { 0% { transform:translateX(-100%) } 45% { transform:translateX(0) } 100% { transform:translateX(100%) } }
        @media (prefers-reduced-motion: reduce) {
          #pl-preloader * { animation-duration: 0.001s !important; animation-delay: 0s !important; }
        }
      `}</style>
      <div
        id="pl-preloader"
        ref={overlayRef}
        role="status"
        aria-label="Loading Josephdeliverycompany"
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: '#061529',
          zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div ref={wordmarkRef} style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }} />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <div ref={fillRef} style={{ height: '100%', width: '0%', backgroundColor: '#c0392b' }} />
        </div>

        <div ref={counterRef} style={{
          position: 'absolute', bottom: '16px', right: '24px',
          fontSize: 'clamp(11px,1.5vw,13px)', fontWeight: 700,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em', color: '#94a3b8',
        }}>000</div>

        <div ref={wipePanelRef} style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#c0392b',
          transform: 'translateX(-100%)',
          pointerEvents: 'none',
        }} />
      </div>
    </>
  );
}

/* ── App shell ─────────────────────────────────────────────────────────── */
export default function App({ Component, pageProps }) {
  const router = useRouter();
  /* True only on the homepage — evaluated at first render so the
     preloader is in the DOM before any content paints.             */
  const isHome = router.pathname === '/';

  return (
    <>
      {isHome && <Preloader />}
      <Component {...pageProps} />
      <Chatbot />
    </>
  );
}
