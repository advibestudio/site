import type { SiteContent, Lead, Project } from './types';

export const defaultContent: SiteContent = {
  brand: {
    name: 'AdVibe Studio',
    logoText: 'ADVIBE',
    tagline: 'AI video ads that turn attention into orders.',
  },
  settings: {
    whatsappNumber: '2348012345678',
    whatsappDisplay: 'AdVibe Studio',
    whatsappMessage:
      "Hi AdVibe Studio, I'm {name} from {business}. I just ordered {offer}. My reference is {ref}.",
    email: 'hello@advibe.studio',
    pixelId: '',
    paymentInstructions:
      'Bank transfer — AdVibe Studio, GTBank 0123456789. Use your reference code as narration, then send proof on WhatsApp.',
    deliveryDays: 5,
  },
  banner: { enabled: true, campaignId: 'black-friday' },
  hero: {
    headline: 'Ads that turn attention into orders.',
    subheadline:
      'We turn your product into scroll-stopping AI video ads for Facebook, Instagram, TikTok and WhatsApp Status — ready in 5 days, so you are never late for a sales season.',
    primaryCta: 'Get my video ad',
    secondaryCta: 'See our work',
    stats: [
      { value: '120+', label: 'videos delivered' },
      { value: '48', label: 'businesses served' },
      { value: '5 days', label: 'average delivery' },
    ],
  },
  problem: {
    heading: "People don't read everything. They scroll.",
    lines: [
      'Your customer may never read your flyer.',
      'They may never visit your website.',
      'They may never stop long enough to understand what your business does.',
      'But they might watch a great video.',
    ],
    transition: "That's where we come in.",
  },
  services: [
    { id: 'product', title: 'Product Ads', description: 'Make your product impossible to ignore.' },
    { id: 'service', title: 'Service Ads', description: 'Turn complicated services into simple stories.' },
    { id: 'ugc', title: 'UGC-Style Ads', description: 'Make your offer feel native to the feed.' },
    { id: 'explainer', title: 'Explainer Videos', description: 'Explain what you do without writing an essay.' },
    { id: 'event', title: 'Event & Campaign Ads', description: 'Give your upcoming promotion something worth stopping for.' },
    { id: 'brand', title: 'Brand Videos', description: 'Make your business look as serious as it actually is.' },
  ],
  events: {
    heading: 'Got something coming up?',
    subheading: 'A sale. A product launch. An event. A new service. A campaign.',
    body: "Sales seasons are won before they start. The businesses that launch their ads early get the cheapest clicks and the most orders. Don't wait until the week before to start creating your ads.",
    cta: 'Create my campaign videos',
  },
  campaigns: [
    { id: 'black-friday', name: 'Black Friday', eventDate: '2026-11-27', orderBy: '2026-11-20', bannerText: 'Black Friday is coming. Order by Nov 20 to launch on time.', active: true },
    { id: 'detty-december', name: 'Christmas & Detty December', eventDate: '2026-12-20', orderBy: '2026-12-10', bannerText: 'Detty December sells out early. Lock in your campaign videos now.', active: true },
    { id: 'valentines', name: "Valentine's", eventDate: '2027-02-14', orderBy: '2027-02-05', bannerText: "Valentine's rush starts in January. Be ready.", active: true },
    { id: 'ramadan', name: 'Ramadan & Eid', eventDate: '2027-03-20', orderBy: '2027-03-10', bannerText: 'Ramadan & Eid campaigns perform best when launched early.', active: true },
    { id: 'easter', name: 'Easter', eventDate: '2027-03-28', orderBy: '2027-03-19', bannerText: 'Easter promo season is almost here.', active: true },
    { id: 'independence', name: 'Independence Day', eventDate: '2027-10-01', orderBy: '2027-09-24', bannerText: 'October 1st campaigns — order early.', active: true },
  ],
  portfolio: [
    { id: 'p1', title: 'Glow Serum Launch', client: 'Skincare brand', category: 'Product Ads', youtubeId: 'aqz-KE-bpKQ', orientation: 'vertical', result: '3.2x ROAS on Meta', featured: true, visible: true, order: 1 },
    { id: 'p2', title: 'Ankara Drop Promo', client: 'Fashion e-commerce', category: 'Fashion', youtubeId: 'eRsGyueVLvQ', orientation: 'vertical', result: '41k views in week one', featured: true, visible: true, order: 2 },
    { id: 'p3', title: 'Jollof Bowl Ad', client: 'Restaurant chain', category: 'Food', youtubeId: 'jfKfPfyJRdk', orientation: 'vertical', result: '+38% orders', featured: false, visible: true, order: 3 },
    { id: 'p4', title: 'Fintech Explainer', client: 'Payments startup', category: 'Finance', youtubeId: 'dQw4w9WgXcQ', orientation: 'landscape', result: 'Onboarding up 2x', featured: false, visible: true, order: 4 },
    { id: 'p5', title: 'Black Friday Countdown', client: 'Gadget store', category: 'Event & Sale', youtubeId: '60ItHLz5WEA', orientation: 'vertical', result: 'Sold out in 72h', featured: true, visible: true, order: 5 },
    { id: 'p6', title: 'Shortlet Showcase', client: 'Real estate', category: 'Real Estate', youtubeId: '9bZkp7q19f0', orientation: 'landscape', result: '12 bookings', featured: false, visible: true, order: 6 },
    { id: 'p7', title: 'UGC Unboxing', client: 'Haircare brand', category: 'UGC', youtubeId: 'kJQP7kiw5Fk', orientation: 'vertical', result: 'CPM down 44%', featured: false, visible: true, order: 7 },
    { id: 'p8', title: 'Gym Membership Drive', client: 'Fitness studio', category: 'Service Ads', youtubeId: 'aqz-KE-bpKQ', orientation: 'vertical', result: '210 sign-ups', featured: false, visible: true, order: 8 },
  ],
  categories: ['All', 'Product Ads', 'Service Ads', 'UGC', 'Fashion', 'Food', 'Event & Sale', 'Real Estate', 'Finance'],
  pricing: {
    heading: 'Pick your goal. We handle the rest.',
    subheading: 'Simple packages, honest prices, no surprises. Everything is confirmed before production starts.',
    goals: [
      { id: 'one', label: 'I need one great video', blurb: 'A single ad, done properly.' },
      { id: 'test', label: 'I want to test different ads', blurb: 'Run several versions, find the winner, put your money behind it.' },
      { id: 'monthly', label: 'I want videos every month', blurb: 'Never run out of ads. One flat fee.' },
    ],
  },
  offers: [
    {
      id: 'single-30', name: 'Single 30s Video', goal: 'one', duration: '30 seconds', quantity: 1,
      price: 25000, unitNote: 'one video', description: 'One 30-second ad. Quick start.',
      whoFor: 'Perfect for a first campaign or a single promotion.',
      features: ['Script', 'AI visuals', 'Voiceover', 'Editing & branding'],
      included: ['1 revision round', 'HD delivery (vertical + landscape)', 'CTA end-card', 'Delivered in 5 days'],
      goodToKnow: ['AI scenes are regenerated rather than frame-edited', 'Verify names, prices and contact details before production', 'Full usage rights for paid ads'],
      cta: 'Create my 30-second video', featured: false, active: true, order: 1,
    },
    {
      id: 'single-60', name: 'Single 60s Video', goal: 'one', duration: '60 seconds', quantity: 1,
      price: 35000, unitNote: 'one video', description: 'One 60-second ad. Story or explainer.',
      whoFor: 'For businesses that need more room to explain their offer.',
      features: ['Longer storytelling', 'More scenes', 'Script', 'Voiceover & branding'],
      included: ['1 revision round', 'HD delivery (vertical + landscape)', 'CTA end-card', 'Delivered in 5 days'],
      goodToKnow: ['AI scenes are regenerated rather than frame-edited', 'Verify names, prices and contact details before production', 'Full usage rights for paid ads'],
      cta: 'Create my 60-second video', featured: false, active: true, order: 2,
    },
    {
      id: 'bundle-5', name: '5 Creative Test Pack', goal: 'test', duration: '30 seconds', quantity: 5,
      price: 95000, unitNote: '₦19,000 per video', description: '5 × 30-second advertising creatives.',
      whoFor: 'Meta Ads, TikTok, Instagram — different hooks, different angles, real data.',
      features: ['5 different hooks', '5 different angles', 'Script for each', 'Voiceover & branding'],
      included: ['1 revision round per video', 'HD delivery', 'Testing structure guide', 'Delivered in 7 days'],
      goodToKnow: ['One ad gives you one chance. Five give you data.', 'Usage rights for paid ads included'],
      badge: 'Most popular', cta: 'Start testing', featured: true, active: true, order: 3,
    },
    {
      id: 'bundle-10', name: '10 Creative Test Pack', goal: 'test', duration: '30 seconds', quantity: 10,
      price: 185000, unitNote: '₦18,500 per video', description: '10 × 30-second creatives. Your creative testing machine.',
      whoFor: 'Serious media buyers who need volume and variety.',
      features: ['10 hooks & angles', 'Product testing sets', 'Scripts for each', 'Voiceover & branding'],
      included: ['1 revision round per video', 'HD delivery', 'Testing structure guide', 'Delivered in 10 days'],
      goodToKnow: ['Best cost per video outside the monthly plan', 'Usage rights for paid ads included'],
      cta: 'Build my testing machine', featured: false, active: true, order: 4,
    },
    {
      id: 'monthly-studio', name: 'Monthly Studio', goal: 'monthly', duration: '30–60 seconds', quantity: 15,
      price: 250000, unitNote: '≈ ₦16,700 per video', description: 'Never run out of ads. Up to 15 AI advertising videos every month.',
      whoFor: 'Brands running always-on campaigns across up to 3 product or service categories.',
      features: ['15 videos / month', 'Up to 3 categories', 'Priority production', 'Monthly creative planning'],
      included: ['Hooks & promotional campaigns', 'Product & service ads', 'Social media creatives', 'Revision rounds included'],
      goodToKnow: ['Renews monthly, cancel anytime', 'Unused videos do not roll over', 'Dedicated creative lead'],
      badge: 'Best value', cta: 'Become a creative partner', featured: false, active: true, order: 5,
    },
  ],
  whyUs: {
    heading: 'Why businesses choose us',
    statement: "You don't need a camera crew to create a great advertisement anymore.",
    points: [
      'No expensive shoot', 'No studio booking', 'No actors required', 'No complicated production',
      'Faster creative testing', 'More variations', 'Built for social media',
    ],
  },
  process: {
    heading: 'How it works',
    steps: [
      { title: "Tell us what you're selling", description: 'Business details, product, offer, audience.' },
      { title: 'We build the concept', description: 'Our team develops the hook, script and creative direction.' },
      { title: 'You approve the direction', description: 'You review the concept before production starts.' },
      { title: 'We produce', description: 'AI visuals + voice + editing + branding.' },
      { title: 'You review', description: 'You receive the preview and consolidate corrections.' },
      { title: 'Revision & delivery', description: 'Your included revision is applied. Clean HD version delivered.' },
    ],
  },
  testimonials: [
    { id: 't1', name: 'Chiamaka E.', business: 'Lush Threads', industry: 'Fashion', quote: 'The Black Friday video paid for itself in the first day of the sale. We have never launched that fast.', featured: true, visible: true },
    { id: 't2', name: 'Ibrahim M.', business: 'Milestone Properties', industry: 'Real Estate', quote: 'Clients now ask if we hired a film crew. It was one video, delivered in four days.', featured: true, visible: true },
    { id: 't3', name: 'Funke A.', business: 'Taste of Home Kitchen', industry: 'Food', quote: 'We tested five ads and finally knew which message our customers care about. Orders followed.', featured: false, visible: true },
  ],
  faqs: [
    { id: 'f1', q: 'How long does production take?', a: 'Most single videos are delivered in 5 working days after you approve the concept. Bundles take 7–10 days. Rush delivery is available as an add-on.', visible: true },
    { id: 'f2', q: 'What do I need to provide?', a: 'Your logo, product photos or links (Instagram or Drive is fine), and a short brief about your offer. We handle script, visuals, voiceover and editing.', visible: true },
    { id: 'f3', q: 'Do I need to be on camera?', a: 'No. Our videos are built with AI visuals and professional voiceover — no filming, no actors, no studio.', visible: true },
    { id: 'f4', q: 'How many revisions do I get?', a: 'Every package includes one consolidated revision round. Additional revision rounds are available as an add-on.', visible: true },
    { id: 'f5', q: 'Can I use the videos for paid ads?', a: 'Yes. Every video comes with full usage rights for Facebook, Instagram, TikTok, YouTube and WhatsApp.', visible: true },
    { id: 'f6', q: 'How do I pay?', a: 'After you submit the order form you get bank transfer details with a reference code, or you can continue on WhatsApp. Production starts once payment is confirmed.', visible: true },
    { id: 'f7', q: "What if I don't like the first version?", a: 'That is what the approval step and revision round are for. You approve the concept before production, and you get one revision round after the preview.', visible: true },
    { id: 'f8', q: 'Do you offer monthly packages?', a: 'Yes — Monthly Studio gives you up to 15 videos every month across up to 3 product categories for one flat fee.', visible: true },
  ],
  aiNote: {
    title: 'AI production note',
    body: 'Our videos are produced with AI tooling. AI-generated scenes can sometimes require regeneration rather than conventional frame-by-frame editing, which is why revisions are consolidated into one round. Please carefully verify names, prices, contact details, product information and other important details in your brief before production starts.',
  },
  finalCta: {
    heading: 'Your next sale starts with one good video.',
    subheading: 'Tell us what you are selling. We will handle the rest.',
    primaryCta: 'Get my video ad',
  },
};

export const seedLeads: Lead[] = [
  { id: 'l1', ref: 'AV-1042', date: '2026-10-19', name: 'John Doe', business: 'ABC Fashion', whatsapp: '2348098765432', email: 'john@abcfashion.ng', offerId: 'bundle-5', offerName: '5 Creative Test Pack', price: 95000, industry: 'Fashion', product: 'Ankara two-piece sets', event: 'Black Friday', notes: 'Wants UGC style hooks', status: 'Qualified', paymentStatus: 'Deposit', utmSource: 'facebook' },
  { id: 'l2', ref: 'AV-1043', date: '2026-10-20', name: 'Ngozi U.', business: 'GlowUp Skincare', whatsapp: '2347011122233', email: 'ngozi@glowup.ng', offerId: 'single-30', offerName: 'Single 30s Video', price: 25000, industry: 'Beauty', product: 'Vitamin C serum', event: 'None', notes: '', status: 'New', paymentStatus: 'Unpaid', utmSource: 'instagram' },
  { id: 'l3', ref: 'AV-1041', date: '2026-10-15', name: 'Emeka O.', business: 'GadgetHub', whatsapp: '2349033344455', email: 'emeka@gadgethub.ng', offerId: 'monthly-studio', offerName: 'Monthly Studio', price: 250000, industry: 'Electronics', product: 'Phone accessories', event: 'Detty December', notes: 'Renews monthly', status: 'Won', paymentStatus: 'Paid', utmSource: 'whatsapp' },
];

export const seedProjects: Project[] = [
  { id: 'pr1', ref: 'PRJ-1024', client: 'ABC Fashion', contact: 'John Doe', whatsapp: '2348098765432', packageName: '5 Creative Test Pack', videosTotal: 5, videosDone: 2, status: 'In production', payment: 'Deposit', startedUnpaid: false, deadline: '2026-10-28', assigned: 'Tunde B.' },
  { id: 'pr2', ref: 'PRJ-1025', client: 'GlowUp Skincare', contact: 'Ngozi U.', whatsapp: '2347011122233', packageName: 'Single 30s Video', videosTotal: 1, videosDone: 0, status: 'Briefing', payment: 'Unpaid', startedUnpaid: true, approvedBy: 'Adaeze O. — agreed payment 25 Oct', deadline: '2026-10-24', assigned: 'Tunde B.' },
  { id: 'pr3', ref: 'PRJ-1023', client: 'GadgetHub', contact: 'Emeka O.', whatsapp: '2349033344455', packageName: 'Monthly Studio', videosTotal: 15, videosDone: 9, status: 'Review', payment: 'Paid', startedUnpaid: false, deadline: '2026-10-31', assigned: 'Adaeze O.' },
  { id: 'pr4', ref: 'PRJ-1022', client: 'Taste of Home Kitchen', contact: 'Funke A.', whatsapp: '2347055566677', packageName: '5 Creative Test Pack', videosTotal: 5, videosDone: 5, status: 'Closed', payment: 'Paid', startedUnpaid: false, deadline: '2026-10-12', assigned: 'Tunde B.' },
];
