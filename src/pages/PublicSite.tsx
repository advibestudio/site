import { lazy, Suspense, useEffect, useState } from 'react';
import type { PortfolioItem, Offer } from '@/content/types';
import { useStore } from '@/lib/store';
import { CountryProvider } from '@/lib/country';
import { Nav, Hero, Proof, Showcase, StickyBar } from '@/sections/chrome';
import { Problem, Services, Events, Pricing, WhyUs, Process, Testimonials, Faq, FinalCta, Footer, ClientSpotlight } from '@/sections/sections';
import { Lightbox } from '@/components/shared';

// The order form and the "just started" pop-ups are separate small downloads, fetched quietly
// AFTER the page is up, so they never slow down the first load.
const loadOrderModal = () => import('@/components/OrderModal').then((m) => ({ default: m.OrderModal }));
const OrderModal = lazy(loadOrderModal);
const LivePopups = lazy(() => import('@/components/LivePopups'));

function Page() {
  const { content } = useStore();
  const sec = content.sections; // the on/off switches from Admin → Website → Sections
  const [playing, setPlaying] = useState<PortfolioItem | null>(null);
  const [orderOffer, setOrderOffer] = useState<Offer | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderEvent, setOrderEvent] = useState<string>('');
  const [popupsReady, setPopupsReady] = useState(false);

  useEffect(() => {
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const t = idle ? idle(() => { void loadOrderModal(); }) : window.setTimeout(() => { void loadOrderModal(); }, 3000);
    const p = window.setTimeout(() => setPopupsReady(true), 4000);
    return () => { if (!idle) clearTimeout(t); clearTimeout(p); };
  }, []);

  useEffect(() => {
    document.body.classList.add('is-public');
    return () => document.body.classList.remove('is-public');
  }, []);

  const openOrder = (offer?: Offer, eventName = '') => {
    setOrderOffer(offer ?? null);
    setOrderEvent(eventName);
    setOrderOpen(true);
  };

  return (
    <div className="studio" style={{ minHeight: '100dvh' }}>
      <Nav onOrder={() => openOrder()} />
      <main>
        <Hero onOrder={() => openOrder()} onPlay={setPlaying} />
        {sec.proof && <Proof />}
        {sec.showcase && <Showcase onPlay={setPlaying} />}
        {sec.clients && <ClientSpotlight onPlay={setPlaying} />}
        {sec.problem && <Problem />}
        {sec.services && <Services />}
        {sec.events && <Events onOrder={(ev) => openOrder(undefined, ev)} />}
        <Pricing onChoose={(o) => openOrder(o)} />
        {sec.whyUs && <WhyUs />}
        {sec.process && <Process />}
        {sec.testimonials && <Testimonials />}
        {sec.faq && <Faq />}
        {sec.finalCta && <FinalCta onOrder={() => openOrder()} />}
      </main>
      <Footer />
      <StickyBar onOrder={() => openOrder()} />
      <Lightbox item={playing} onClose={() => setPlaying(null)} />
      {sec.liveToasts && popupsReady && (
        <Suspense fallback={null}><LivePopups paused={orderOpen || Boolean(playing)} /></Suspense>
      )}
      {orderOpen && (
        <Suspense fallback={<div className="overlay"><div className="modal" style={{ textAlign: 'center', color: 'rgb(var(--muted))' }}>Loading…</div></div>}>
          <OrderModal
            key={`${orderOffer?.id ?? 'none'}-${orderEvent}`}
            offer={orderOffer}
            eventName={orderEvent}
            onClose={() => setOrderOpen(false)}
            onPickOffer={() => {
              setOrderOpen(false);
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function PublicSite() {
  return (
    <CountryProvider>
      <Page />
    </CountryProvider>
  );
}
