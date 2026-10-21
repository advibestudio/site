export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  youtubeId: string;
  orientation: 'vertical' | 'landscape';
  result?: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

export interface Offer {
  id: string;
  name: string;
  goal: 'one' | 'test' | 'monthly';
  duration: string;
  quantity: number;
  price: number;
  unitNote: string;
  description: string;
  whoFor: string;
  features: string[];
  included: string[];
  goodToKnow: string[];
  badge?: string;
  cta: string;
  featured: boolean;
  active: boolean;
  order: number;
}

export interface Campaign {
  id: string;
  name: string;
  eventDate: string; // ISO
  orderBy: string; // ISO
  bannerText: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  business: string;
  industry: string;
  quote: string;
  featured: boolean;
  visible: boolean;
}

export interface Faq { id: string; q: string; a: string; visible: boolean; }

export interface SiteContent {
  brand: { name: string; logoText: string; tagline: string };
  settings: {
    whatsappNumber: string;
    whatsappDisplay: string;
    whatsappMessage: string;
    email: string;
    pixelId: string;
    paymentInstructions: string;
    deliveryDays: number;
  };
  banner: { enabled: boolean; campaignId: string };
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    stats: { value: string; label: string }[];
  };
  problem: { heading: string; lines: string[]; transition: string };
  services: { id: string; title: string; description: string }[];
  events: { heading: string; subheading: string; body: string; cta: string };
  campaigns: Campaign[];
  portfolio: PortfolioItem[];
  categories: string[];
  pricing: {
    heading: string;
    subheading: string;
    goals: { id: 'one' | 'test' | 'monthly'; label: string; blurb: string }[];
  };
  offers: Offer[];
  whyUs: { heading: string; statement: string; points: string[] };
  process: { heading: string; steps: { title: string; description: string }[] };
  testimonials: Testimonial[];
  faqs: Faq[];
  aiNote: { title: string; body: string };
  finalCta: { heading: string; subheading: string; primaryCta: string };
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  ref: string;
  date: string;
  name: string;
  business: string;
  whatsapp: string;
  email: string;
  offerId: string;
  offerName: string;
  price: number;
  industry: string;
  product: string;
  event: string;
  notes: string;
  status: LeadStatus;
  paymentStatus: 'Unpaid' | 'Deposit' | 'Paid';
  utmSource?: string;
}

export type ProjectStatus =
  | 'Briefing' | 'In production' | 'Review' | 'Revision' | 'Delivered' | 'Closed';

export interface Project {
  id: string;
  ref: string;
  client: string;
  contact: string;
  whatsapp: string;
  packageName: string;
  videosTotal: number;
  videosDone: number;
  status: ProjectStatus;
  payment: 'Unpaid' | 'Deposit' | 'Paid';
  startedUnpaid: boolean;
  approvedBy?: string;
  deadline: string; // ISO
  assigned: string;
}

export interface AuditEntry { id: string; at: string; user: string; action: string }

export interface SessionUser { email: string; name: string; role: 'owner' | 'ops' }
