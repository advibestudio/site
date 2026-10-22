import { lazy, Suspense, useEffect, useState } from 'react';
import type { PortfolioItem, Offer } from '@/content/types';
import { Nav, Hero, Proof, Showcase, StickyBar } from '@/sections/chrome';
import { Problem, Services, Events, Pricing, WhyUs, Process, Testimonials, Faq, FinalCta, Footer } from '@/sections/sections';
import { Lightbox } from '@/components/shared';

// The order form is its own small download, fetched quietly in the background after the
// page is up (so tapping a button is instant) and never slows down the first load.
const loadOrderModal = () => import('@/components/OrderModal').then((m) => ({ default: m.OrderModal }));
const OrderModal = lazy(loadOrderModal);

export default function PublicSite() {
  const [playing, setPlaying] = useState<PortfolioItem | null>(null);
  const [orderOffer, setOrderOffer] = useState<Offer | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderEvent, setOrderEvent] = useState<string>('');

  useEffect(() => {
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const t = idle ? idle(() => { void loadOrderModal(); }) : window.setTimeout(() => { void loadOrderModal(); }, 3000);
    return () => { if (!idle) clearTimeout(t); };
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
        <Proof />
        <Showcase onPlay={setPlaying} />
        <Problem />
        <Services />
        <Events onOrder={(ev) => openOrder(undefined, ev)} />
        <Pricing onChoose={(o) => openOrder(o)} />
        <WhyUs />
        <Process />
        <Testimonials />
        <Faq />
        <FinalCta onOrder={() => openOrder()} />
      </main>
      <Footer />
      <StickyBar onOrder={() => openOrder()} />
      <Lightbox item={playing} onClose={() => setPlaying(null)} />
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
