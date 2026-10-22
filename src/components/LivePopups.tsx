import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { isLive } from '@/lib/supabase';
import { fetchRecentOrders, type RecentOrder } from '@/lib/publicApi';

/**
 * "JUST STARTED" POP-UPS
 * ----------------------
 * Small notices like  "Ada from 🇬🇭 Ghana just started their creative process".
 * They are REAL: they come from orders people actually submitted, and only people who left the
 * "show my first name and country" box ticked appear. Only a first name and a country are ever
 * shared — never a surname, phone, email or business. Manually-typed orders never appear.
 * Visitors can close them (and they stay closed for the rest of the visit).
 */
const OFF_KEY = 'advibe.popups.off';

function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return 'just now';
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function LivePopups({ paused }: { paused: boolean }) {
  const { content, leads } = useStore();
  const cfg = content.popups;
  const [items, setItems] = useState<RecentOrder[]>([]);
  const [current, setCurrent] = useState<RecentOrder | null>(null);
  const [off, setOff] = useState(() => { try { return sessionStorage.getItem(OFF_KEY) === '1'; } catch { return false; } });
  const shown = useRef(0);
  const idx = useRef(0);

  // Load who recently started an order.
  useEffect(() => {
    let cancelled = false;
    if (isLive) {
      fetchRecentOrders(cfg.withinHours, 10)
        .then((rows) => { if (!cancelled) setItems(rows.filter((r) => r.first_name)); })
        .catch(() => { /* no pop-ups if the lookup fails — never an error on screen */ });
    } else {
      // Demo mode: only this browser's own orders that agreed to be shown.
      const since = Date.now() - cfg.withinHours * 3600000;
      setItems(leads.filter((l) => l.showPublic && l.source === 'website' && new Date(l.date).getTime() >= since - 86400000)
        .map((l) => ({ first_name: l.name.split(/\s+/)[0], country: l.country, created_at: new Date().toISOString() })));
    }
    return () => { cancelled = true; };
  }, [cfg.withinHours, leads]);

  // Show one, hide it after 6 seconds, wait, show the next… up to the per-visit limit.
  useEffect(() => {
    if (off || !items.length || shown.current >= cfg.maxPerVisit) return;
    if (current) {
      const t = setTimeout(() => setCurrent(null), 6000);
      return () => clearTimeout(t);
    }
    if (paused) return;
    const wait = (shown.current === 0 ? cfg.delaySeconds : cfg.gapSeconds) * 1000;
    const t = setTimeout(() => {
      shown.current += 1;
      setCurrent(items[idx.current++ % items.length]);
    }, wait);
    return () => clearTimeout(t);
  }, [items, current, paused, off, cfg.delaySeconds, cfg.gapSeconds, cfg.maxPerVisit]);

  if (!current || off || paused) return null;
  const c = content.countries.find((k) => k.code === current.country);
  const first = cap(current.first_name.slice(0, 24));
  const recent = ago(current.created_at) === 'just now';
  return (
    <div className="live-toast anim-pop" role="status" aria-live="polite">
      <span className="live-avatar" aria-hidden="true">{first[0]}</span>
      <p>
        <strong>{first}</strong> from {c ? <><span aria-hidden="true">{c.flag}</span> {c.name}</> : current.country}
        <span>{recent ? 'just started their creative process' : `started their creative process · ${ago(current.created_at)}`}</span>
      </p>
      <button className="live-close" aria-label="Close notice and stop these notices" onClick={() => { setCurrent(null); setOff(true); try { sessionStorage.setItem(OFF_KEY, '1'); } catch { /* ignore */ } }}>
        <X size={16} />
      </button>
    </div>
  );
}
