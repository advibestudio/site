import React, { useMemo, useState } from 'react';
import { Check, ExternalLink, Eye, EyeOff, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useStore, extractYouTubeId, ytThumb } from '@/lib/store';
import type { SiteContent, Offer, PortfolioItem } from '@/content/types';
import { defaultContent } from '@/content/defaultContent';

const inputCls = 'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#f5a524] focus:outline-none';
const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/45';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className={labelCls}>{label}</span>{children}</label>;
}

const TABS = ['Hero', 'Portfolio', 'Pricing & Offers', 'Testimonials', 'FAQs', 'Campaigns', 'Settings'] as const;
type Tab = (typeof TABS)[number];

export function ContentView({ role, actor }: { role: 'owner' | 'ops'; actor: string }) {
  const { content, saveContent, resetContent, mode } = useStore();
  const [tab, setTab] = useState<Tab>('Hero');
  const [draft, setDraft] = useState<SiteContent>(() => structuredClone(content));
  const [savedFlash, setSavedFlash] = useState(false);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(content), [draft, content]);

  const set = (fn: (d: SiteContent) => void) => {
    const next = structuredClone(draft);
    fn(next);
    setDraft(next);
  };
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const save = async () => {
    setSaving(true); setSaveErr('');
    const err = await saveContent(draft, actor, `Saved ${tab} changes`);
    setSaving(false);
    if (err) { setSaveErr(err); return; }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const visibleTabs = role === 'owner' ? TABS : TABS.filter((t) => t !== 'Settings');

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">Website content</h1>
          <p className="mt-1 text-sm text-white/50">{mode === 'live' ? 'Everything on the public site is edited here — no code, no redeploy. Changes go live for every visitor the moment you save.' : 'Demo mode: changes only show in this browser. Connect Supabase (README, Part 4) to publish them to real visitors.'}</p>
        </div>
        <a href="#/" target="_blank" className="flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white/75 transition hover:bg-white/10">
          <ExternalLink className="h-3.5 w-3.5" /> View on site
        </a>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`min-h-[40px] shrink-0 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition ${tab === t ? 'border-[#f5a524] bg-[#f5a524] text-black' : 'border-white/15 text-white/55 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Hero' && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <Field label="Headline"><input className={inputCls} value={draft.hero.headline} onChange={(e) => set((d) => { d.hero.headline = e.target.value; })} /></Field>
          <Field label="Subheadline"><textarea className={`${inputCls} min-h-[90px] resize-none`} value={draft.hero.subheadline} onChange={(e) => set((d) => { d.hero.subheadline = e.target.value; })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary button"><input className={inputCls} value={draft.hero.primaryCta} onChange={(e) => set((d) => { d.hero.primaryCta = e.target.value; })} /></Field>
            <Field label="Secondary button"><input className={inputCls} value={draft.hero.secondaryCta} onChange={(e) => set((d) => { d.hero.secondaryCta = e.target.value; })} /></Field>
          </div>
          <Field label="Trust strip (value — label, one per line)">
            <textarea className={`${inputCls} min-h-[90px] font-mono text-xs`} value={draft.hero.stats.map((s) => `${s.value} — ${s.label}`).join('\n')}
              onChange={(e) => set((d) => { d.hero.stats = e.target.value.split('\n').filter(Boolean).map((l) => { const [v, ...rest] = l.split('—'); return { value: (v ?? '').trim(), label: rest.join('—').trim() }; }); })} />
          </Field>
        </div>
      )}

      {tab === 'Portfolio' && <PortfolioEditor draft={draft} set={set} />}
      {tab === 'Pricing & Offers' && <OffersEditor draft={draft} set={set} />}
      {tab === 'Testimonials' && (
        <div className="space-y-3">
          {draft.testimonials.map((t, i) => (
            <div key={t.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Name"><input className={inputCls} value={t.name} onChange={(e) => set((d) => { d.testimonials[i].name = e.target.value; })} /></Field>
                <Field label="Business"><input className={inputCls} value={t.business} onChange={(e) => set((d) => { d.testimonials[i].business = e.target.value; })} /></Field>
                <Field label="Industry"><input className={inputCls} value={t.industry} onChange={(e) => set((d) => { d.testimonials[i].industry = e.target.value; })} /></Field>
              </div>
              <Field label="Quote"><textarea className={`${inputCls} min-h-[70px] resize-none`} value={t.quote} onChange={(e) => set((d) => { d.testimonials[i].quote = e.target.value; })} /></Field>
              <div className="flex items-center justify-between">
                <button onClick={() => set((d) => { d.testimonials[i].visible = !d.testimonials[i].visible; })} className="flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/70">
                  {t.visible ? <Eye className="h-3.5 w-3.5 text-[#f5a524]" /> : <EyeOff className="h-3.5 w-3.5" />} {t.visible ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => set((d) => { d.testimonials.splice(i, 1); })} className="grid h-10 w-10 place-items-center rounded-lg text-white/35 hover:text-red-300" aria-label="Delete testimonial"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          <AddButton label="Add testimonial" onClick={() => set((d) => { d.testimonials.push({ id: crypto.randomUUID(), name: '', business: '', industry: '', quote: '', featured: false, visible: true }); })} />
        </div>
      )}

      {tab === 'FAQs' && (
        <div className="space-y-3">
          {draft.faqs.map((f, i) => (
            <div key={f.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Field label="Question"><input className={inputCls} value={f.q} onChange={(e) => set((d) => { d.faqs[i].q = e.target.value; })} /></Field>
              <Field label="Answer"><textarea className={`${inputCls} min-h-[70px] resize-none`} value={f.a} onChange={(e) => set((d) => { d.faqs[i].a = e.target.value; })} /></Field>
              <div className="flex items-center justify-between">
                <button onClick={() => set((d) => { d.faqs[i].visible = !d.faqs[i].visible; })} className="flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/70">
                  {f.visible ? <Eye className="h-3.5 w-3.5 text-[#f5a524]" /> : <EyeOff className="h-3.5 w-3.5" />} {f.visible ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => set((d) => { d.faqs.splice(i, 1); })} className="grid h-10 w-10 place-items-center rounded-lg text-white/35 hover:text-red-300" aria-label="Delete FAQ"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          <AddButton label="Add FAQ" onClick={() => set((d) => { d.faqs.push({ id: crypto.randomUUID(), q: '', a: '', visible: true }); })} />
        </div>
      )}

      {tab === 'Campaigns' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div>
              <p className="font-semibold text-white">Top banner with countdown</p>
              <p className="text-xs text-white/45">Shows the selected campaign's banner text and a countdown to its order-by date.</p>
            </div>
            <button onClick={() => set((d) => { d.banner.enabled = !d.banner.enabled; })}
              className={`min-h-[40px] rounded-full px-4 text-xs font-bold uppercase ${draft.banner.enabled ? 'bg-[#f5a524] text-black' : 'border border-white/20 text-white/60'}`}>
              {draft.banner.enabled ? 'On' : 'Off'}
            </button>
          </div>
          {draft.campaigns.map((c, i) => (
            <div key={c.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Event name"><input className={inputCls} value={c.name} onChange={(e) => set((d) => { d.campaigns[i].name = e.target.value; })} /></Field>
                <Field label="Banner text"><input className={inputCls} value={c.bannerText} onChange={(e) => set((d) => { d.campaigns[i].bannerText = e.target.value; })} /></Field>
                <Field label="Event date"><input type="date" className={`${inputCls} [color-scheme:dark]`} value={c.eventDate} onChange={(e) => set((d) => { d.campaigns[i].eventDate = e.target.value; })} /></Field>
                <Field label="Order-by date"><input type="date" className={`${inputCls} [color-scheme:dark]`} value={c.orderBy} onChange={(e) => set((d) => { d.campaigns[i].orderBy = e.target.value; })} /></Field>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => set((d) => { d.campaigns[i].active = !d.campaigns[i].active; })} className="flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/70">
                  {c.active ? <Eye className="h-3.5 w-3.5 text-[#f5a524]" /> : <EyeOff className="h-3.5 w-3.5" />} {c.active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => set((d) => { d.banner.campaignId = c.id; d.banner.enabled = true; })}
                  className={`min-h-[40px] rounded-lg border px-3 text-xs font-semibold ${draft.banner.campaignId === c.id ? 'border-[#f5a524] text-[#f5a524]' : 'border-white/15 text-white/70'}`}>
                  {draft.banner.campaignId === c.id ? '✓ In banner' : 'Show in banner'}
                </button>
                <button onClick={() => set((d) => { d.campaigns.splice(i, 1); })} className="grid h-10 w-10 place-items-center rounded-lg text-white/35 hover:text-red-300" aria-label="Delete campaign"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          <AddButton label="Add campaign" onClick={() => set((d) => { d.campaigns.push({ id: crypto.randomUUID(), name: 'New event', eventDate: '2027-01-01', orderBy: '2026-12-20', bannerText: '', active: true }); })} />
        </div>
      )}

      {tab === 'Settings' && role === 'owner' && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name"><input className={inputCls} value={draft.brand.name} onChange={(e) => set((d) => { d.brand.name = e.target.value; })} /></Field>
            <Field label="Logo text"><input className={inputCls} value={draft.brand.logoText} onChange={(e) => set((d) => { d.brand.logoText = e.target.value; })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number (country code, digits only)"><input className={inputCls} value={draft.settings.whatsappNumber} onChange={(e) => set((d) => { d.settings.whatsappNumber = e.target.value; })} /></Field>
            <Field label="WhatsApp display name"><input className={inputCls} value={draft.settings.whatsappDisplay} onChange={(e) => set((d) => { d.settings.whatsappDisplay = e.target.value; })} /></Field>
          </div>
          <Field label="WhatsApp order message template — variables: {name} {business} {offer} {ref}">
            <textarea className={`${inputCls} min-h-[80px] resize-none`} value={draft.settings.whatsappMessage} onChange={(e) => set((d) => { d.settings.whatsappMessage = e.target.value; })} />
          </Field>
          <Field label="Payment instructions (shown after order)">
            <textarea className={`${inputCls} min-h-[80px] resize-none`} value={draft.settings.paymentInstructions} onChange={(e) => set((d) => { d.settings.paymentInstructions = e.target.value; })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Contact email"><input className={inputCls} value={draft.settings.email} onChange={(e) => set((d) => { d.settings.email = e.target.value; })} /></Field>
            <Field label="Meta Pixel ID"><input className={inputCls} value={draft.settings.pixelId} onChange={(e) => set((d) => { d.settings.pixelId = e.target.value; })} placeholder="Optional" /></Field>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/50">
              <p className="font-semibold text-white/65">Make webhook</p>
              <p>Set in your hosting settings (VITE_MAKE_WEBHOOK_URL), not here. See README, Part 6.</p>
            </div>
          </div>
          <Field label="Delivery days (shown on site)">
            <input type="number" min={1} className={inputCls} value={draft.settings.deliveryDays} onChange={(e) => set((d) => { d.settings.deliveryDays = Number(e.target.value) || 5; })} />
          </Field>
          <button onClick={async () => { if (!window.confirm('Reset ALL website content to the original defaults? This cannot be undone.')) return; const err = await resetContent(); if (err) setSaveErr(err); else setDraft(structuredClone(defaultContent)); }} className="flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white/60 transition hover:bg-white/10">
            <RotateCcw className="h-3.5 w-3.5" /> Reset all content to defaults
          </button>
        </div>
      )}

      {saveErr && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <strong>Not saved.</strong> {saveErr} — your edits are still on screen; try again, or check README Part 9 (Troubleshooting).
        </div>
      )}

      {/* save bar */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-16 z-40 px-4 md:bottom-6 md:left-60">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-xl border border-[#f5a524]/40 bg-[#17130a] p-3 pl-5 shadow-2xl">
            <p className="text-sm text-amber-200">Unsaved changes</p>
            <div className="flex gap-2">
              <button onClick={() => setDraft(structuredClone(content))} className="min-h-[44px] rounded-lg px-4 text-sm font-semibold text-white/60 hover:text-white">Discard</button>
              <button onClick={save} disabled={saving} className="flex min-h-[44px] items-center gap-2 rounded-lg bg-[#f5a524] px-5 font-display text-xs uppercase tracking-wide text-black hover:brightness-110 disabled:opacity-60">
                <Check className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {savedFlash && !dirty && (
        <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black shadow-xl md:bottom-8">
          {mode === 'live' ? '✓ Saved — live on the site' : '✓ Saved in this browser (demo mode)'}
        </div>
      )}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-sm font-semibold text-white/55 transition hover:border-[#f5a524]/60 hover:text-[#f5a524]">
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

/* ---------- PORTFOLIO EDITOR ---------- */
function PortfolioEditor({ draft, set }: { draft: SiteContent; set: (fn: (d: SiteContent) => void) => void }) {
  return (
    <div className="space-y-3">
      <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
        Paste a YouTube link — the video appears on the site instantly. Thumbnails load from YouTube automatically.
      </p>
      {draft.portfolio.map((p, i) => (
        <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex gap-4">
            <img src={ytThumb(p.youtubeId)} alt="" className="hidden h-20 w-32 shrink-0 rounded-lg object-cover sm:block" />
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <Field label="YouTube URL or ID">
                <input className={inputCls} value={p.youtubeId} onChange={(e) => set((d) => { d.portfolio[i].youtubeId = extractYouTubeId(e.target.value); })} placeholder="https://youtube.com/watch?v=…" />
              </Field>
              <Field label="Title"><input className={inputCls} value={p.title} onChange={(e) => set((d) => { d.portfolio[i].title = e.target.value; })} /></Field>
              <Field label="Client / business type"><input className={inputCls} value={p.client} onChange={(e) => set((d) => { d.portfolio[i].client = e.target.value; })} /></Field>
              <Field label="Result line (optional)"><input className={inputCls} value={p.result ?? ''} onChange={(e) => set((d) => { d.portfolio[i].result = e.target.value; })} placeholder="e.g. 3.2x ROAS" /></Field>
              <Field label="Category">
                <select className={inputCls} value={p.category} onChange={(e) => set((d) => { d.portfolio[i].category = e.target.value; })}>
                  {draft.categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c} className="bg-neutral-900">{c}</option>)}
                </select>
              </Field>
              <Field label="Format">
                <select className={inputCls} value={p.orientation} onChange={(e) => set((d) => { d.portfolio[i].orientation = e.target.value as PortfolioItem['orientation']; })}>
                  <option value="vertical" className="bg-neutral-900">Vertical 9:16 (Reels / TikTok / Status)</option>
                  <option value="landscape" className="bg-neutral-900">Landscape 16:9</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={() => set((d) => { d.portfolio[i].featured = !d.portfolio[i].featured; })}
              className={`min-h-[40px] rounded-lg border px-3 text-xs font-semibold ${p.featured ? 'border-[#f5a524] text-[#f5a524]' : 'border-white/15 text-white/60'}`}>
              {p.featured ? '★ Featured in hero' : 'Feature in hero'}
            </button>
            <button onClick={() => set((d) => { d.portfolio[i].visible = !d.portfolio[i].visible; })} className="flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/70">
              {p.visible ? <Eye className="h-3.5 w-3.5 text-[#f5a524]" /> : <EyeOff className="h-3.5 w-3.5" />} {p.visible ? 'Visible' : 'Hidden'}
            </button>
            <button onClick={() => set((d) => { d.portfolio.splice(i, 1); })} className="grid h-10 w-10 place-items-center rounded-lg text-white/35 hover:text-red-300" aria-label="Delete video"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
      <AddButton label="Add video" onClick={() => set((d) => {
        d.portfolio.push({ id: crypto.randomUUID(), title: 'New video', client: '', category: d.categories[1] ?? 'Product Ads', youtubeId: '', orientation: 'vertical', result: '', featured: false, visible: true, order: d.portfolio.length + 1 });
      })} />
    </div>
  );
}

/* ---------- OFFERS EDITOR ---------- */
function OffersEditor({ draft, set }: { draft: SiteContent; set: (fn: (d: SiteContent) => void) => void }) {
  return (
    <div className="space-y-3">
      {draft.offers.sort((a, b) => a.order - b.order).map((o) => {
        const i = draft.offers.findIndex((x) => x.id === o.id);
        return (
          <div key={o.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Package name"><input className={inputCls} value={o.name} onChange={(e) => set((d) => { d.offers[i].name = e.target.value; })} /></Field>
              <Field label="Price (₦, numbers only)"><input type="number" className={inputCls} value={o.price} onChange={(e) => set((d) => { d.offers[i].price = Number(e.target.value) || 0; })} /></Field>
              <Field label="Goal group">
                <select className={inputCls} value={o.goal} onChange={(e) => set((d) => { d.offers[i].goal = e.target.value as Offer['goal']; })}>
                  <option value="one" className="bg-neutral-900">I need one great video</option>
                  <option value="test" className="bg-neutral-900">I want to test different ads</option>
                  <option value="monthly" className="bg-neutral-900">I want videos every month</option>
                </select>
              </Field>
              <Field label="Unit note"><input className={inputCls} value={o.unitNote} onChange={(e) => set((d) => { d.offers[i].unitNote = e.target.value; })} placeholder="₦19,000 per video" /></Field>
              <Field label="Short description"><input className={inputCls} value={o.description} onChange={(e) => set((d) => { d.offers[i].description = e.target.value; })} /></Field>
              <Field label="Button text"><input className={inputCls} value={o.cta} onChange={(e) => set((d) => { d.offers[i].cta = e.target.value; })} /></Field>
              <Field label="Badge (optional)"><input className={inputCls} value={o.badge ?? ''} onChange={(e) => set((d) => { d.offers[i].badge = e.target.value || undefined; })} placeholder="Most popular" /></Field>
              <Field label="Who it's for"><input className={inputCls} value={o.whoFor} onChange={(e) => set((d) => { d.offers[i].whoFor = e.target.value; })} /></Field>
            </div>
            <Field label="Features (one per line)">
              <textarea className={`${inputCls} min-h-[80px] resize-none`} value={o.features.join('\n')} onChange={(e) => set((d) => { d.offers[i].features = e.target.value.split('\n').filter(Boolean); })} />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => set((d) => { d.offers[i].featured = !d.offers[i].featured; })}
                className={`min-h-[40px] rounded-lg border px-3 text-xs font-semibold ${o.featured ? 'border-[#f5a524] text-[#f5a524]' : 'border-white/15 text-white/60'}`}>
                {o.featured ? '★ Highlighted' : 'Highlight card'}
              </button>
              <button onClick={() => set((d) => { d.offers[i].active = !d.offers[i].active; })} className="flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/70">
                {o.active ? <Eye className="h-3.5 w-3.5 text-[#f5a524]" /> : <EyeOff className="h-3.5 w-3.5" />} {o.active ? 'On sale' : 'Hidden'}
              </button>
              <button onClick={() => set((d) => { d.offers.splice(i, 1); })} className="grid h-10 w-10 place-items-center rounded-lg text-white/35 hover:text-red-300" aria-label="Delete offer"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        );
      })}
      <AddButton label="Add offer" onClick={() => set((d) => {
        d.offers.push({ id: crypto.randomUUID(), name: 'New package', goal: 'one', duration: '30 seconds', quantity: 1, price: 0, unitNote: '', description: '', whoFor: '', features: [], included: [], goodToKnow: [], cta: 'Choose this', featured: false, active: true, order: d.offers.length + 1 });
      })} />
    </div>
  );
}
