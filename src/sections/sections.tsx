import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, MessageCircle, Check, CalendarDays, Plus, Package, Briefcase, Sparkles, Clapperboard, PartyPopper, Tv } from 'lucide-react';
import { useStore, fmtNaira, waLink } from '@/lib/store';
import { track } from '@/lib/tracking';
import type { Offer } from '@/content/types';
import { Reveal, SecHead, EmLast } from '@/components/shared';

const ArrowBtn = () => <span className="btn-arrow" aria-hidden="true"><ArrowRight size={18} strokeWidth={2.4} /></span>;
const TONES = ['peach', 'mint', 'butter', 'sky', 'lilac'];

/* ---------- PROBLEM ---------- */
export function Problem() {
  const { content } = useStore();
  return (
    <section className="sec" style={{ paddingBottom: 'clamp(40px,6vw,70px)' }}>
      <div className="wrap" style={{ maxWidth: 960 }}>
        <Reveal><h2 className="h-section" style={{ maxWidth: '22ch' }}><EmLast text={content.problem.heading} /></h2></Reveal>
        <div className="problem-lines">
          {content.problem.lines.map((line, i) => (
            <Reveal key={i} delay={i * 0.06}><p>{line}</p></Reveal>
          ))}
        </div>
        <Reveal delay={0.15}><p className="problem-end">{content.problem.transition}</p></Reveal>
      </div>
    </section>
  );
}

/* ---------- SERVICES ---------- */
const ICONS = [Package, Briefcase, Sparkles, Clapperboard, PartyPopper, Tv];
export function Services() {
  const { content } = useStore();
  return (
    <section id="services" className="sec">
      <div className="wrap">
        <SecHead label="What we create">Every kind of ad your feed is <em>missing.</em></SecHead>
        <ul className="tiles">
          {content.services.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={s.id} style={{ display: 'flex' }}>
                <Reveal delay={i * 0.05} className="tile-wrap" >
                  <article className={`tile tone-${TONES[i % TONES.length]}`} style={{ height: '100%' }}>
                    <span className="tile-icon"><Icon size={22} /></span>
                    <h3 className="h-tile">{s.title}</h3>
                    <p>{s.description}</p>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- EVENTS / SEASONAL ---------- */
export function Events({ onOrder }: { onOrder: (eventName: string) => void }) {
  const { content } = useStore();
  const upcoming = content.campaigns
    .filter((c) => c.active && new Date(c.eventDate) >= new Date())
    .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="seasons">
          <Reveal>
            <span className="pill-label" style={{ background: '#ffffffa6' }}>Sales seasons</span>
            <h2 className="h-section" style={{ maxWidth: '16ch' }}><EmLast text={content.events.heading} /></h2>
            <p className="season-sub">{content.events.subheading}</p>
            <p className="season-body">{content.events.body}</p>
          </Reveal>
          <div className="season-grid">
            {upcoming.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05}>
                <button onClick={() => onOrder(c.name)} className="season" style={{ width: '100%' }}>
                  <span>
                    <small><CalendarDays size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: -1 }} />
                      {new Date(c.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</small>
                    <strong>{c.name}</strong>
                  </span>
                  <ArrowRight size={20} />
                </button>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <button onClick={() => onOrder('')} className="btn-studio" style={{ marginTop: 34 }}><span>{content.events.cta}</span><ArrowBtn /></button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- PRICING ---------- */
function OfferCard({ offer, onChoose }: { offer: Offer; onChoose: (o: Offer) => void }) {
  const [drawer, setDrawer] = useState<'none' | 'included' | 'good'>('none');
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className={`offer ${offer.featured ? 'is-featured' : ''}`}>
      {offer.badge && <span className="offer-badge">{offer.badge}</span>}
      <h3>{offer.name}</h3>
      <p className="offer-desc">{offer.description}</p>
      <p className="offer-price">{fmtNaira(offer.price)}{offer.goal === 'monthly' && <small> /mo</small>}</p>
      <p className="offer-note">{offer.unitNote}</p>
      <p className="offer-who">{offer.whoFor}</p>
      <ul className="offer-list">
        {offer.features.map((f) => <li key={f}><Check size={18} strokeWidth={2.6} />{f}</li>)}
      </ul>
      {(['included', 'good'] as const).map((d) => (
        <div key={d} className="drawer">
          <button onClick={() => setDrawer(drawer === d ? 'none' : d)} aria-expanded={drawer === d}>
            {d === 'included' ? "What's included" : 'Good to know'}
            <ChevronDown size={18} style={{ transform: drawer === d ? 'rotate(180deg)' : 'none' }} />
          </button>
          <AnimatePresence initial={false}>
            {drawer === d && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                {(d === 'included' ? offer.included : offer.goodToKnow).map((x) => <li key={x}>· {x}</li>)}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ))}
      <div className="offer-spacer" />
      <button onClick={() => onChoose(offer)} className="btn-studio"><span>{offer.cta}</span><ArrowBtn /></button>
    </motion.div>
  );
}

export function Pricing({ onChoose }: { onChoose: (o: Offer) => void }) {
  const { content } = useStore();
  const [goal, setGoal] = useState<'one' | 'test' | 'monthly'>('one');
  const offers = useMemo(
    () => content.offers.filter((o) => o.active && o.goal === goal).sort((a, b) => a.order - b.order),
    [content.offers, goal],
  );
  const activeGoal = content.pricing.goals.find((g) => g.id === goal);
  return (
    <section id="pricing" className="sec">
      <div className="wrap">
        <SecHead label="Packages" lead={content.pricing.subheading}><EmLast text={content.pricing.heading} /></SecHead>
        <Reveal delay={0.05}>
          <div className="goal-tabs" role="tablist" aria-label="Choose your goal">
            {content.pricing.goals.map((g) => (
              <button key={g.id} role="tab" aria-selected={goal === g.id} onClick={() => setGoal(g.id)} className="goal">
                <strong>{g.label}</strong><span>{g.blurb}</span>
              </button>
            ))}
          </div>
        </Reveal>
        <div className={`offers ${offers.length > 1 ? '' : 'single'}`}>
          {offers.map((o) => <OfferCard key={o.id} offer={o} onChoose={onChoose} />)}
        </div>
        {goal === 'test' && <p className="pricing-foot">One ad gives you one chance. Multiple ads give you data. {activeGoal?.blurb}</p>}
      </div>
    </section>
  );
}

/* ---------- WHY US ---------- */
export function WhyUs() {
  const { content } = useStore();
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="why-wrap">
          <Reveal>
            <span className="pill-label">{content.whyUs.heading}</span>
            <h2 className="h-section" style={{ maxWidth: '16ch' }}><EmLast text={content.whyUs.statement} /></h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="chips" style={{ paddingTop: 8 }}>
              {content.whyUs.points.map((p, i) => (
                <span key={p} className="chip" style={{ ['--tone' as string]: `rgb(var(--${TONES[i % TONES.length]}))` }}>{p}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- PROCESS ---------- */
export function Process() {
  const { content } = useStore();
  return (
    <section id="process" className="sec">
      <div className="wrap">
        <SecHead label={content.process.heading}>From brief to finished ad in {content.settings.deliveryDays} <em>days.</em></SecHead>
        <ol className="steps">
          {content.process.steps.map((s, i) => (
            <li key={s.title} style={{ display: 'flex' }}>
              <Reveal delay={i * 0.06} className="step-wrap">
                <div className="step-card" style={{ height: '100%' }}>
                  <span className="step-num">Step {i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIALS ---------- */
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
export function Testimonials() {
  const { content } = useStore();
  const items = content.testimonials.filter((t) => t.visible);
  if (!items.length) return null;
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SecHead label="Word on the street">Businesses that stopped scrolling past <em>themselves.</em></SecHead>
        <ul className="quotes">
          {items.map((t, i) => (
            <li key={t.id}>
              <Reveal delay={i * 0.07} className="quote-wrap">
                <figure className={`quote ${i === 0 ? 'is-lead' : ''}`}>
                  <span className="quote-mark" aria-hidden="true">“</span>
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <span className="quote-avatar">{initials(t.name)}</span>
                    <span><span className="quote-name">{t.name}</span><span className="quote-role">{t.business} · {t.industry}</span></span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- FAQ + AI NOTE ---------- */
function FaqItem({ id, q, a, open, setOpen, note = false }: { id: string; q: string; a: string; open: string | null; setOpen: (v: string | null) => void; note?: boolean }) {
  const isOpen = open === id;
  return (
    <div className={`faq-item ${isOpen ? 'is-open' : ''} ${note ? 'is-note' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen}>
        <span>{q}</span>
        <span className="faq-icon"><Plus size={18} /></span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }} style={{ overflow: 'hidden' }}>
            <p className="faq-a">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const { content } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const faqs = content.faqs.filter((f) => f.visible);
  return (
    <section id="faq" className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SecHead label="Questions" center>Before you <em>ask.</em></SecHead>
        <div className="faq">
          {faqs.map((f) => <FaqItem key={f.id} id={f.id} q={f.q} a={f.a} open={open} setOpen={setOpen} />)}
          <FaqItem id="ai-note" q={content.aiNote.title} a={content.aiNote.body} open={open} setOpen={setOpen} note />
        </div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
export function FinalCta({ onOrder }: { onOrder: () => void }) {
  const { content } = useStore();
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="final">
          <Reveal>
            <h2 className="h-section"><EmLast text={content.finalCta.heading} /></h2>
            <p className="lead">{content.finalCta.subheading}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="final-cta">
              <button onClick={onOrder} className="btn-studio"><span>{content.finalCta.primaryCta}</span><ArrowBtn /></button>
              <a className="btn-ghost" href={waLink(content.settings.whatsappNumber, `Hi ${content.settings.whatsappDisplay}, I want a video ad for my business.`)}
                target="_blank" rel="noreferrer" onClick={() => track('Contact')}>
                <MessageCircle size={18} /> WhatsApp us
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
export function Footer() {
  const { content } = useStore();
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div style={{ maxWidth: 320 }}>
            <p className="site-brand" style={{ color: 'rgb(var(--ink))' }}>{content.brand.name}</p>
            <p style={{ marginTop: 8 }}>{content.brand.tagline}</p>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <a href={`mailto:${content.settings.email}`}>{content.settings.email}</a>
            <a href={waLink(content.settings.whatsappNumber, 'Hi!')} target="_blank" rel="noreferrer" onClick={() => track('Contact')}>WhatsApp</a>
          </div>
          <div className="foot-col">
            <h4>Explore</h4>
            {[['Work', '#work'], ['Packages', '#pricing'], ['How it works', '#process'], ['FAQs', '#faq']].map(([l, h]) => <a key={h} href={h}>{l}</a>)}
          </div>
        </div>
        <p className="foot-legal">© {new Date().getFullYear()} {content.brand.name}. AI-assisted production, human-directed creative.</p>
      </div>
    </footer>
  );
}
