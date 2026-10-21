import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, Copy, Check, Loader2 } from 'lucide-react';
import { useStore, fmtNaira, waLink } from '@/lib/store';
import { track } from '@/lib/tracking';
import type { Offer, Lead } from '@/content/types';

interface Props {
  offer: Offer | null;
  eventName?: string;
  onClose: () => void;
  onPickOffer: () => void;
}

const INDUSTRIES = ['Fashion', 'Food & Restaurant', 'Beauty & Skincare', 'Real Estate', 'Finance / Fintech', 'Electronics', 'Events', 'Education', 'Health & Fitness', 'Other'];

const Arrow = () => <span className="btn-arrow" aria-hidden="true"><ArrowRight size={18} strokeWidth={2.4} /></span>;

export function OrderModal({ offer, eventName, onClose, onPickOffer }: Props) {
  const { content, addLead } = useStore();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Lead | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', whatsapp: '', email: '', business: '', industry: INDUSTRIES[0], product: '',
    event: eventName ?? '', notes: '', honey: '',
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const steps = ['Contact', 'Business', 'Your need', 'Review'];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const validate = (): boolean => {
    const e: string[] = [];
    if (step === 0) {
      if (form.name.trim().length < 2) e.push('Please enter your name.');
      if (form.whatsapp.replace(/[^\d]/g, '').length < 7) e.push('Please enter a valid WhatsApp number with country code.');
      if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.push('That email address looks incomplete.');
    }
    if (step === 1) {
      if (form.business.trim().length < 2) e.push('Please enter your business name.');
      if (form.product.trim().length < 3) e.push('Tell us in one line what you sell.');
    }
    setErrors(e);
    return e.length === 0;
  };

  const submit = async () => {
    if (sending) return;
    if (form.honey) { onClose(); return; } // spam-bot trap: real people never see this field
    if (!offer) return;
    setSending(true);
    try {
      const utm = new URLSearchParams(window.location.search).get('utm_source') ?? undefined;
      const lead = await addLead({
        name: form.name.trim(), business: form.business.trim(), whatsapp: form.whatsapp.trim(),
        email: form.email.trim(), offerId: offer.id, offerName: offer.name, price: offer.price,
        industry: form.industry, product: form.product.trim(), event: form.event || 'None',
        notes: form.notes.trim(), utmSource: utm,
      });
      setDone(lead);
    } finally {
      setSending(false);
    }
  };

  const waMsg = useMemo(() => {
    if (!done || !offer) return '';
    return content.settings.whatsappMessage
      .replace('{name}', done.name).replace('{business}', done.business)
      .replace('{offer}', done.offerName).replace('{ref}', done.ref);
  }, [done, offer, content.settings.whatsappMessage]);

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Order form">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="modal" onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <div>
            <p className="modal-kicker">{done ? 'Order received' : offer ? 'Your package' : 'Start your order'}</p>
            {!done && offer && <p className="modal-title">{offer.name} <small>· {fmtNaira(offer.price)} · {offer.unitNote}</small></p>}
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close"><X size={20} /></button>
        </div>

        {done ? (
          <div className="form-stack" style={{ gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <CheckCircle2 size={44} style={{ color: 'rgb(var(--accent))', flex: 'none' }} />
              <div>
                <p className="modal-title">We've received your request.</p>
                <p style={{ color: 'rgb(var(--muted))', fontSize: 15 }}>Reference: <strong style={{ color: 'rgb(var(--ink))' }}>{done.ref}</strong></p>
              </div>
            </div>
            <div className="card-soft">
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Pay now</p>
              <p style={{ color: 'rgb(var(--ink-2))' }}>{content.settings.paymentInstructions}</p>
              <button
                onClick={() => { navigator.clipboard?.writeText(done.ref); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="btn-back" style={{ minHeight: 44, marginTop: 14, fontSize: 14 }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} Copy reference {done.ref}
              </button>
            </div>
            <a className="btn-studio is-brand" style={{ justifyContent: 'center', padding: '0 26px' }}
              href={waLink(content.settings.whatsappNumber, waMsg)} target="_blank" rel="noreferrer" onClick={() => track('Contact')}>
              <MessageCircle size={20} /> <span>Continue on WhatsApp</span>
            </a>
            <p style={{ textAlign: 'center', fontSize: 13.5, color: 'rgb(var(--muted))' }}>Your order details are pre-filled in the message.</p>
          </div>
        ) : !offer ? (
          <div className="form-stack">
            <p style={{ color: 'rgb(var(--ink-2))' }}>Choose a package first — it takes 10 seconds.</p>
            <button onClick={onPickOffer} className="btn-studio"><span>View packages</span><Arrow /></button>
          </div>
        ) : (
          <>
            <div className="progress">
              {steps.map((s, i) => (
                <div key={s}><i className={i <= step ? 'on' : ''} /><p className={i === step ? 'cur' : ''}>{s}</p></div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="form-stack">
                {step === 0 && (
                  <>
                    <input className="field" placeholder="Full name *" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
                    <input className="field" placeholder="WhatsApp number (with country code) *" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} inputMode="tel" autoComplete="tel" />
                    <input className="field" placeholder="Email (optional — for updates & offers)" value={form.email} onChange={(e) => set('email', e.target.value)} inputMode="email" autoComplete="email" />
                    <input style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" value={form.honey} onChange={(e) => set('honey', e.target.value)} aria-hidden="true" name="website" />
                  </>
                )}
                {step === 1 && (
                  <>
                    <input className="field" placeholder="Business name *" value={form.business} onChange={(e) => set('business', e.target.value)} autoComplete="organization" />
                    <select className="field" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <input className="field" placeholder="What do you sell? (one line) *" value={form.product} onChange={(e) => set('product', e.target.value)} />
                  </>
                )}
                {step === 2 && (
                  <>
                    <select className="field" value={form.event} onChange={(e) => set('event', e.target.value)}>
                      <option value="">No specific event / deadline</option>
                      {content.campaigns.filter((c) => c.active).map((c) => (
                        <option key={c.id} value={c.name}>{c.name} — {new Date(c.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    <textarea className="field" style={{ minHeight: 120, resize: 'none' }} placeholder="Notes: link to product photos (Drive / Instagram), preferred tone, target audience…" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
                  </>
                )}
                {step === 3 && (
                  <div className="card-soft">
                    {[
                      ['Package', `${offer.name} — ${fmtNaira(offer.price)}`],
                      ['Name', form.name], ['WhatsApp', form.whatsapp],
                      ...(form.email ? [['Email', form.email]] : []),
                      ['Business', `${form.business} (${form.industry})`],
                      ['Selling', form.product], ['Event', form.event || 'None'],
                    ].map(([k, v]) => <div key={k} className="row-kv"><span>{k}</span><span>{v}</span></div>)}
                    <p style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgb(var(--line))', fontSize: 13.5, color: 'rgb(var(--muted))' }}>
                      Includes {offer.included[0]?.toLowerCase()}. Full terms are confirmed before production starts.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {errors.length > 0 && <div className="err-box">{errors.map((e) => <p key={e}>{e}</p>)}</div>}

            <div className="modal-actions">
              {step > 0 && <button onClick={() => { setErrors([]); setStep(step - 1); }} className="btn-back"><ArrowLeft size={18} /> Back</button>}
              {step < 3 ? (
                <button onClick={() => validate() && setStep(step + 1)} className="btn-studio"><span>Continue</span><Arrow /></button>
              ) : (
                <button onClick={submit} disabled={sending} className="btn-studio">
                  <span>{sending ? 'Sending…' : 'Submit order'}</span>
                  <span className="btn-arrow" aria-hidden="true">{sending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} strokeWidth={2.4} />}</span>
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
