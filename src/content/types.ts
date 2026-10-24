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
  /** Country codes this event is shown in (e.g. ['NG','GH']). Empty/missing = every country. */
  countries?: string[];
}

/** One market you sell to. Each has its own prices, currency, payment details and web link. */
export interface Country {
  code: string;              // 'NG', 'GH', 'KE', 'US', 'UK'
  slug: string;              // used in the ad link: https://yoursite/#/gh
  name: string;
  flag: string;              // emoji flag
  currency: string;          // 'NGN', 'GHS', 'KES', 'USD', 'GBP'
  symbol: string;            // '₦', 'GH₵', 'KSh', '$', '£'
  active: boolean;           // switch a whole country on/off
  /** Price of each package in this country's currency, keyed by offer id. Missing = package hidden here. */
  prices: Record<string, number>;
  whatsappNumber: string;    // blank = use the main number from Settings
  paymentInstructions: string; // blank = use the main text from Settings
  pixelId: string;           // blank = use the main Meta Pixel from Settings
  /** Typical cost of ONE traditionally-produced video ad in this country's currency (used by the cost-comparison card). 0 = unknown. */
  tradLow: number;
  tradHigh: number;
}

export type SectionKey =
  | 'wall' | 'proof' | 'showcase' | 'clients' | 'problem' | 'services'
  | 'events' | 'whyUs' | 'process' | 'testimonials' | 'faq' | 'finalCta' | 'liveToasts' | 'aiCompare';

export interface FeaturedClient {
  name: string;              // short display name, e.g. CirclesFundMe
  legalName: string;         // full registered name
  sector: string;            // e.g. Fintech
  logo: string;              // full logo image (path inside the site, or a web address)
  mark: string;              // small square icon for badges
  badge: string;             // e.g. Repeat client
  heading: string;
  body: string;
  points: string[];
  /** Portfolio videos whose "Client" field contains this text are shown inside the spotlight. */
  matchName: string;
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
  countries: Country[];
  defaultCountry: string;    // country code shown when a visitor arrives on the plain link
  sections: Record<SectionKey, boolean>;
  client: FeaturedClient;
  /** The "What AI replaces" cost card under the packages, and the link to the full breakdown page. */
  aiCompare: { title: string; tradLabel: string; aiLabel: string; body: string; linkText: string };
  popups: { delaySeconds: number; gapSeconds: number; maxPerVisit: number; withinHours: number };
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
  events: {
    heading: string; subheading: string; body: string; cta: string;
    /** Pull public holidays automatically from a free calendar API (Nager.Date). */
    auto: boolean;
    /** Add built-in shopping dates (Black Friday, Cyber Monday, Valentine's, Mother's/Father's Day …). */
    builtin: boolean;
    maxItems: number;      // how many upcoming events to show
    windowDays: number;    // only look this many days ahead
    leadDays: number;      // "order by" = event date minus this many days
    hide: string;          // comma-separated words; events containing any of them are not shown
  };
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
  country: string;      // country code, e.g. 'GH'
  currency: string;     // currency code the price is in, e.g. 'GHS'
  source: string;       // 'website' or where a manually-entered order came from
  showPublic: boolean;  // customer agreed to appear in the "just started" pop-up
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
