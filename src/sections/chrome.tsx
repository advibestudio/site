import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowDown, ChevronLeft, ChevronRight, MessageCircle, Menu, X, Play } from 'lucide-react';
import { useStore, waLink, fmtNaira } from '@/lib/store';
import { track } from '@/lib/tracking';
import type { PortfolioItem } from '@/content/types';
import { Reveal, VideoCard, SecHead, EmLast } from '@/components/shared';
import { Wall } from '@/components/Wall';

function ArrowBtn() {
  return <span className="btn-arrow" aria-hidden="true"><ArrowRight size={18} strokeWidth={2.4} /></span>;
}

/* ---------- NAV ---------- */
export function Nav({ onOrder }: { onOrder: () => void }) {
  const { content } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links = [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'Packages', href: '#pricing' },
    { label: 'How it works', href: '#process' },
    { label: 'FAQs', href: '#faq' },
  ];
  return (
    <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-nav-bar">
        <a href="#top" className="site-brand" aria-label={`${content.brand.name} home`}>
          <span className="brand-mark"><Play size={15} fill="currentColor" /></span>
          <span>{content.brand.name}</span>
        </a>
        <nav className="site-links" aria-label="Main">
          {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <div className="site-actions">
          <button onClick={onOrder} className="btn-studio is-sm">
            <span>Get your video</span><span className="btn-arrow" aria-hidden="true"><ArrowRight size={16} strokeWidth={2.4} /></span>
          </button>
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-menu" aria-label="Mobile">
          {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
        </nav>
      )}
    </header>
  );
}

/* ---------- EVENT COUNTDOWN (sits in the hero as a small pill) ---------- */
function useCountdown(target: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(target + 'T00:00:00').getTime() - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
  };
}

function EventPill({ onOrder }: { onOrder: () => void }) {
  const { content } = useStore();
  const campaign = content.campaigns.find((c) => c.id === content.banner.campaignId && c.active);
  const cd = useCountdown(campaign?.orderBy ?? '2026-12-31');
  if (!content.banner.enabled || !campaign) return null;
  const p = (v: number) => String(v).padStart(2, '0');
  return (
    <button onClick={onOrder} className="event-pill">
      <span className="event-dot" aria-hidden="true" />
      <span>{campaign.bannerText}</span>
      <span className="event-clock" aria-label="Time left to order">{cd.d}d {p(cd.h)}:{p(cd.m)}:{p(cd.s)}</span>
    </button>
  );
}

/* ---------- HERO ---------- */
const Scribble = ({ d, len, w, h }: { d: string; len: number; w: number; h: number }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true"><path d={d} style={{ ['--len' as string]: len }} /></svg>
);

export function Hero({ onOrder, onPlay }: { onOrder: () => void; onPlay: (i: PortfolioItem) => void }) {
  const { content } = useStore();
  const items = useMemo(
    () => content.portfolio.filter((p) => p.visible).sort((a, b) => a.order - b.order),
    [content.portfolio],
  );
  const from = Math.min(...content.offers.filter((o) => o.active).map((o) => o.price));
  const micro = [`Delivered in ${content.settings.deliveryDays} days`, Number.isFinite(from) ? `Packages from ${fmtNaira(from)}` : ''].filter(Boolean).join(' · ');
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="wrap hero-copy">
        <EventPill onOrder={onOrder} />
        <h1 id="hero-title" className="h-hero"><span><EmLast text={content.hero.headline} /></span></h1>
        <p className="hero-sub">{content.hero.subheadline}</p>
        <div className="hero-cta">
          <button onClick={onOrder} className="btn-studio"><span>{content.hero.primaryCta}</span><ArrowBtn /></button>
          <a className="btn-ghost" href="#work">{content.hero.secondaryCta} <ArrowDown size={18} /></a>
        </div>
        {micro && <p className="hero-micro">{micro}</p>}
      </div>

      <div className="wall-zone">
        <div className="note note-a" aria-hidden="true">
          <span>ads we've made</span>
          <Scribble w={90} h={50} len={140} d="M6 6 C 8 34, 38 44, 80 38 M80 38 L66 28 M80 38 L68 50" />
        </div>
        <div className="note note-b" aria-hidden="true">
          <span>no camera crew</span>
          <Scribble w={90} h={50} len={140} d="M84 6 C 82 34, 52 44, 10 38 M10 38 L24 28 M10 38 L22 50" />
        </div>
        <Wall items={items} onPlay={onPlay} />
        <div className="wall-floor" aria-hidden="true" />
        <p className="wall-hint">Drag to spin · Tap a video to watch</p>
      </div>
    </section>
  );
}

/* ---------- PROOF: marquee + trust numbers ---------- */
export function Proof() {
  const { content } = useStore();
  const words = ['Product ads', 'UGC-style ads', 'Event promos', 'Explainer videos', 'Black Friday', 'Detty December', "Valentine's", 'Launch campaigns', 'Brand videos', 'Service ads'];
  const row = [...words, ...words];
  const tones = ['tone-peach', 'tone-mint', 'tone-butter', 'tone-lilac'];
  return (
    <section className="proof" aria-label="What we make and results">
      <div className="wrap">
        <p className="proof-label">What we make for businesses like yours</p>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">{row.map((w, i) => <span key={i}>{w}</span>)}</div>
        </div>
        <ul className="stats">
          {content.hero.stats.map((s, i) => (
            <li key={s.label}>
              <Reveal delay={i * 0.07}>
                <div className={`stat ${tones[i % tones.length]}`}>
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- SHOWCASE (filterable scroller) ---------- */
export function Showcase({ onPlay }: { onPlay: (i: PortfolioItem) => void }) {
  const { content } = useStore();
  const [cat, setCat] = useState('All');
  const scroller = useRef<HTMLDivElement>(null);
  const items = useMemo(
    () => content.portfolio.filter((p) => p.visible && (cat === 'All' || p.category === cat)).sort((a, b) => a.order - b.order),
    [content.portfolio, cat],
  );
  const [idx, setIdx] = useState(0);
  const cardW = () => {
    const el = scroller.current?.querySelector<HTMLElement>(':scope > *');
    return el ? el.offsetWidth + 16 : 320;
  };
  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * cardW(), behavior: 'smooth' });
  const onScroll = () => { const el = scroller.current; if (el) setIdx(Math.round(el.scrollLeft / cardW())); };

  return (
    <section id="work" className="sec">
      <div className="wrap">
        <SecHead label="The work">Ads we've made. Tap one. <em>Watch it.</em></SecHead>

        <div className="filters" role="tablist" aria-label="Filter work">
          {content.categories.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className="filter"
              onClick={() => { setCat(c); scroller.current?.scrollTo({ left: 0 }); setIdx(0); }}>
              {c}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="lead">No videos in this category yet — check back soon.</p>
        ) : (
          <>
            <div ref={scroller} onScroll={onScroll} className="scroller" style={{ marginTop: 18 }}>
              {items.map((item) => (
                <div key={item.id} style={{ width: item.orientation === 'vertical' ? 'min(260px, 68vw)' : 'min(520px, 86vw)' }}>
                  <VideoCard item={item} onPlay={onPlay} />
                </div>
              ))}
            </div>
            <div className="scroll-controls">
              <button className="circle-btn" onClick={() => scrollBy(-1)} aria-label="Previous videos"><ChevronLeft size={20} /></button>
              <button className="circle-btn" onClick={() => scrollBy(1)} aria-label="Next videos"><ChevronRight size={20} /></button>
              <span className="counter">{String(Math.min(idx + 1, items.length)).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ---------- STICKY MOBILE CTA ---------- */
export function StickyBar({ onOrder }: { onOrder: () => void }) {
  const { content } = useStore();
  return (
    <div className="sticky-bar">
      <button onClick={onOrder} className="btn-studio"><span>Get your video</span><ArrowBtn /></button>
      <a className="sticky-wa" href={waLink(content.settings.whatsappNumber, `Hi ${content.settings.whatsappDisplay}, I want to ask about a video ad.`)}
        target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" onClick={() => track('Contact')}>
        <MessageCircle size={22} />
      </a>
    </div>
  );
}

