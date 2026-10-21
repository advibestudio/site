import { useEffect, useState } from 'react';
import type { PortfolioItem, Offer } from '@/content/types';
import { Nav, Hero, Proof, Showcase, StickyBar } from '@/sections/chrome';
import { Problem, Services, Events, Pricing, WhyUs, Process, Testimonials, Faq, FinalCta, Footer } from '@/sections/sections';
import { Lightbox } from '@/components/shared';
import { OrderModal } from '@/components/OrderModal';

export default function PublicSite() {
  const [playing, setPlaying] = useState<PortfolioItem | null>(null);
  const [orderOffer, setOrderOffer] = useState<Offer | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderEvent, setOrderEvent] = useState<string>('');

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
      )}
    </div>
  );
}
