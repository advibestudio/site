import { useEffect, useMemo, useState } from 'react';
import { X, ArrowRight, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';
import { useStore, waLink } from '@/lib/store';
import { getParam, waNumberFor } from '@/lib/money';
import { useCountry } from '@/lib/country';
import { track } from '@/lib/tracking';
import type { Lead } from '@/content/types';

/**
 * FREE STRATEGY SESSION FORM
 * --------------------------
 * The main call-to-action: "Chat with our team on WhatsApp and get a free strategy session."
 * The visitor fills this short form FIRST (so you always capture the lead, with their country),
 * then taps a button that opens WhatsApp with their details already typed in.
 * Saved like any other lead (source = "strategy"), and sent to Make / Google Sheets / SendFox.
 */
export function StrategyModal({ onClose }: { onClose: () => void }) {
  const { content, addLead } = useStore();
  const { country, countries, setCountry } = useCountry();
  const [f, setF] = useState({ name: '', whatsapp: '', email: '', business: '', product: '', honey: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Lead | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const submit = async () => {
    if (sending) return;
    const e: string[] = [];
    if (f.name.trim().length < 2) e.push('Please enter your name.');
    if (f.whatsapp.replace(/[^\d]/g, '').length < 7) e.push('Please enter a valid WhatsApp number with country code.');
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.push('That email address looks incomplete.');
    if (f.business.trim().length < 2) e.push('Please enter your business name.');
    if (f.product.trim().length < 3) e.push('Tell us in a few words what you want to promote.');
    setErrors(e);
    if (e.length) return;
    if (f.honey) { onClose(); return; } // spam-bot trap
    setSending(true);
    try {
      const lead = await addLead({
        name: f.name.trim(), business: f.business.trim(), whatsapp: f.whatsapp.trim(), email: f.email.trim(),
        offerId: 'strategy', offerName: 'Free strategy session', price: 0, industry: '', product: f.product.trim(),
        event: 'None', notes: '', utmSource: getParam('utm_source'),
        country: country.code, currency: country.currency, source: 'strategy', showPublic: false,
      }, country.name);
      setDone(lead);
    } finally {
      setSending(false);
    }
  };

  const waMsg = useMemo(() => done
    ? `Hi ${content.settings.whatsappDisplay}, I'm ${done.name} from ${done.business} (${country.name}). I just filled the form for a free strategy session — I want to promote: ${done.product}. Ref ${done.ref}.`
    : '', [done, content.settings.whatsappDisplay, country.name]);

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Free strategy session">
      <div className="modal anim-slide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <p className="modal-kicker">{done ? 'Request received' : 'Free strategy session'}</p>
            {!done && <p className="modal-title">Tell us a little, then chat with our team on WhatsApp.</p>}
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close"><X size={20} /></button>
        </div>

        {done ? (
          <div className="form-stack" style={{ gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <CheckCircle2 size={44} style={{ color: 'rgb(var(--accent))', flex: 'none' }} />
              <div>
                <p className="modal-title">Thanks {done.name.split(' ')[0]} — one last step.</p>
                <p style={{ color: 'rgb(var(--muted))', fontSize: 15 }}>Reference: <strong style={{ color: 'rgb(var(--ink))' }}>{done.ref}</strong></p>
              </div>
            </div>
            <p style={{ color: 'rgb(var(--ink-2))' }}>Tap below to open WhatsApp. Your details are already typed in — just press send and our team will take it from there.</p>
            <a className="btn-studio is-brand" style={{ justifyContent: 'center', padding: '0 26px' }}
              href={waLink(waNumberFor(content.settings.whatsappNumber, country), waMsg)} target="_blank" rel="noreferrer" onClick={() => track('Contact')}>
              <MessageCircle size={20} /> <span>Open WhatsApp</span>
            </a>
          </div>
        ) : (
          <>
            <div className="form-stack">
              <label className="field-label" htmlFor="s-country">Country</label>
              <select id="s-country" className="field" value={country.code} onChange={(e) => setCountry(e.target.value)}>
                {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
              <input className="field" placeholder="Your name *" value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
              <input className="field" placeholder="WhatsApp number (with country code) *" value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} inputMode="tel" autoComplete="tel" />
              <input className="field" placeholder="Business name *" value={f.business} onChange={(e) => set('business', e.target.value)} autoComplete="organization" />
              <input className="field" placeholder="What do you want to promote? *" value={f.product} onChange={(e) => set('product', e.target.value)} />
              <input className="field" placeholder="Email (optional)" value={f.email} onChange={(e) => set('email', e.target.value)} inputMode="email" autoComplete="email" />
              <input style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" value={f.honey} onChange={(e) => set('honey', e.target.value)} aria-hidden="true" name="website" />
            </div>
            {errors.length > 0 && <div className="err-box">{errors.map((e) => <p key={e}>{e}</p>)}</div>}
            <div className="modal-actions">
              <button onClick={submit} disabled={sending} className="btn-studio">
                <span>{sending ? 'Sending…' : 'Continue to WhatsApp'}</span>
                <span className="btn-arrow" aria-hidden="true">{sending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} strokeWidth={2.4} />}</span>
              </button>
            </div>
            <p style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: 'rgb(var(--muted))' }}>Free · No obligation · We reply on WhatsApp</p>
          </>
        )}
      </div>
    </div>
  );
}
