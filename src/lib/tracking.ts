/**
 * META (FACEBOOK) PIXEL
 * ---------------------
 * Paste your Pixel ID in Admin → Website → Settings. It loads automatically
 * on the public site. We fire "Lead" when an order is submitted and "Contact"
 * when someone taps WhatsApp.
 */
type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; push?: Fbq; version?: string };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }

let loadedId = '';

export function initPixel(pixelId: string) {
  const id = pixelId.trim();
  if (!id || loadedId === id || !/^\d{6,20}$/.test(id)) return;
  loadedId = id;
  // Wait a few seconds so the pixel never competes with the page's own first load.
  window.setTimeout(() => startPixel(id), 3500);
}

function startPixel(id: string) {
  if (!window.fbq) {
    const q: unknown[][] = [];
    const fbq: Fbq = (...args: unknown[]) => { q.push(args); };
    fbq.queue = q; fbq.loaded = true; fbq.push = fbq; fbq.version = '2.0'; // same shape as Meta's official snippet
    window.fbq = fbq; window._fbq = fbq;
    const s = document.createElement('script');
    s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    // The loaded script replaces fbq and replays the queue.
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }
}

export function track(event: 'Lead' | 'Contact', data?: Record<string, unknown>) {
  try { window.fbq?.('track', event, data); } catch { /* ignore */ }
}
