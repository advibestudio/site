import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { ytThumb } from '@/lib/store';
import type { PortfolioItem } from '@/content/types';

/** Fade-and-rise when scrolled into view. */
export function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Turns the LAST word of a sentence into the italic-serif accent used in headlines. */
export function EmLast({ text }: { text: string }) {
  const t = text.trim();
  const i = t.lastIndexOf(' ');
  if (i < 0) return <em>{t}</em>;
  return <>{t.slice(0, i + 1)}<em>{t.slice(i + 1)}</em></>;
}

export function SecHead({ label, children, lead, center = false }: { label?: string; children: React.ReactNode; lead?: string; center?: boolean }) {
  return (
    <Reveal className={`sec-head ${center ? 'center' : ''}`}>
      {label && <span className="pill-label">{label}</span>}
      <h2 className="h-section">{children}</h2>
      {lead && <p className="lead">{lead}</p>}
    </Reveal>
  );
}

/** Thumbnail card for a portfolio video (opens the lightbox). */
export function VideoCard({ item, onPlay }: { item: PortfolioItem; onPlay: (item: PortfolioItem) => void }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <button
      onClick={() => onPlay(item)}
      className="vcard"
      style={{ aspectRatio: item.orientation === 'vertical' ? '9 / 16' : '16 / 9' }}
      aria-label={`Play video: ${item.title}`}
    >
      {imgOk ? (
        <img src={ytThumb(item.youtubeId)} alt="" loading="lazy" onError={() => setImgOk(false)} />
      ) : (
        <div className="fallback" />
      )}
      <span className="vcard-play"><Play size={18} fill="currentColor" /></span>
      <span className="vcard-info">
        <span className="vcard-cat">{item.category}</span>
        <span className="vcard-title" style={{ display: 'block' }}>{item.title}</span>
        <span className="vcard-meta" style={{ display: 'block' }}>{item.client}{item.result ? ` · ${item.result}` : ''}</span>
      </span>
    </button>
  );
}

export function Lightbox({ item, onClose }: { item: PortfolioItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [item, onClose]);
  if (!item) return null;
  const vertical = item.orientation === 'vertical';
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Video: ${item.title}`}>
      <button onClick={onClose} className="lightbox-close" aria-label="Close video"><X size={22} /></button>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        className="lightbox-box"
        style={{ maxWidth: vertical ? 380 : 900 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ aspectRatio: vertical ? '9 / 16' : '16 / 9', maxHeight: '78dvh', margin: '0 auto' }}>
          <iframe
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        </div>
        <div className="lightbox-cap">
          <div>
            <p style={{ font: '700 18px var(--font-display)', letterSpacing: '-.02em' }}>{item.title}</p>
            <p style={{ fontSize: 14, opacity: 0.6 }}>{item.client} · {item.category}</p>
          </div>
          {item.result && <span style={{ flex: 'none', padding: '6px 12px', borderRadius: 999, background: 'rgb(var(--brand))', color: 'rgb(var(--ink))', fontSize: 13, fontWeight: 700 }}>{item.result}</span>}
        </div>
      </motion.div>
    </div>
  );
}
