import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { SiteContent, Lead, Project, AuditEntry, SessionUser } from '@/content/types';
import { defaultContent, seedLeads, seedProjects } from '@/content/defaultContent';
import { isLive, supabase } from '@/lib/supabase';
import { sendLeadToMake } from '@/lib/integrations';
import { initPixel, track } from '@/lib/tracking';

/* ==========================================================================
   THE STORE — where all the site's data lives.

   LIVE mode (Supabase keys present):
     • Website text/prices/videos  -> table `site_content`   (everyone can read, staff can edit)
     • Leads                       -> table `leads`          (visitors can only SUBMIT, staff can read)
     • Projects, activity log      -> tables `projects`, `audit_log` (staff only)
     • Admin login                 -> Supabase Auth + table `profiles` (role: owner / ops)

   DEMO mode (no keys): everything is kept in this browser's localStorage so
   you can try the dashboard. Nothing is shared between devices.
   ========================================================================== */

const LS = {
  content: 'advibe.content.v1',
  leads: 'advibe.leads.v1',
  projects: 'advibe.projects.v1',
  audit: 'advibe.audit.v1',
  session: 'advibe.session.v1',
  contentCache: 'advibe.content.cache.v1',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}

/** Fill in any fields missing from saved content (e.g. after we add a new setting). */
function withDefaults(c: Partial<SiteContent> | null | undefined): SiteContent {
  if (!c) return defaultContent;
  return {
    ...defaultContent,
    ...c,
    brand: { ...defaultContent.brand, ...c.brand },
    settings: { ...defaultContent.settings, ...c.settings },
    hero: { ...defaultContent.hero, ...c.hero },
  } as SiteContent;
}

/* ---------- database row <-> app object converters ---------- */
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const leadFromRow = (r: Row): Lead => ({
  id: r.id, ref: r.ref, date: String(r.created_at).slice(0, 10),
  name: r.name, business: r.business ?? '', whatsapp: r.whatsapp, email: r.email ?? '',
  offerId: r.offer_id ?? '', offerName: r.offer_name ?? '', price: Number(r.price ?? 0),
  industry: r.industry ?? '', product: r.product ?? '', event: r.event ?? 'None', notes: r.notes ?? '',
  status: r.status, paymentStatus: r.payment_status, utmSource: r.utm_source ?? undefined,
});
const leadPatchToRow = (p: Partial<Lead>): Row => {
  const m: Row = {};
  if (p.status !== undefined) m.status = p.status;
  if (p.paymentStatus !== undefined) m.payment_status = p.paymentStatus;
  if (p.notes !== undefined) m.notes = p.notes;
  return m;
};
const projectFromRow = (r: Row): Project => ({
  id: r.id, ref: r.ref, client: r.client, contact: r.contact ?? '', whatsapp: r.whatsapp ?? '',
  packageName: r.package_name ?? '', videosTotal: r.videos_total, videosDone: r.videos_done,
  status: r.status, payment: r.payment, startedUnpaid: r.started_unpaid,
  approvedBy: r.approved_by ?? undefined, deadline: String(r.deadline).slice(0, 10), assigned: r.assigned ?? '',
});
const projectToRow = (p: Partial<Project>): Row => {
  const m: Row = {};
  if (p.client !== undefined) m.client = p.client;
  if (p.contact !== undefined) m.contact = p.contact;
  if (p.whatsapp !== undefined) m.whatsapp = p.whatsapp;
  if (p.packageName !== undefined) m.package_name = p.packageName;
  if (p.videosTotal !== undefined) m.videos_total = p.videosTotal;
  if (p.videosDone !== undefined) m.videos_done = p.videosDone;
  if (p.status !== undefined) m.status = p.status;
  if (p.payment !== undefined) m.payment = p.payment;
  if (p.startedUnpaid !== undefined) m.started_unpaid = p.startedUnpaid;
  if (p.approvedBy !== undefined) m.approved_by = p.approvedBy;
  if (p.deadline !== undefined) m.deadline = p.deadline;
  if (p.assigned !== undefined) m.assigned = p.assigned;
  return m;
};

type NewLead = Omit<Lead, 'id' | 'ref' | 'date' | 'status' | 'paymentStatus'>;

interface Store {
  mode: 'live' | 'demo';
  ready: boolean;
  syncError: string;
  clearSyncError: () => void;
  content: SiteContent;
  /** Saves website content. Returns an error message, or null on success. */
  saveContent: (next: SiteContent, actor?: string, action?: string) => Promise<string | null>;
  resetContent: () => Promise<string | null>;
  leads: Lead[];
  addLead: (lead: NewLead) => Promise<Lead>;
  updateLead: (id: string, patch: Partial<Lead>, actor?: string) => void;
  deleteLead: (id: string) => void;
  projects: Project[];
  updateProject: (id: string, patch: Partial<Project>, actor?: string) => void;
  addProject: (p: Omit<Project, 'id' | 'ref'>) => void;
  audit: AuditEntry[];
  log: (user: string, action: string) => void;
  session: SessionUser | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => void;
  refresh: () => void;
}

const Ctx = createContext<Store | null>(null);

let demoRef = Math.floor(1000 + Math.random() * 9000);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() =>
    withDefaults(isLive ? load(LS.contentCache, null) : load(LS.content, null)),
  );
  const [leads, setLeads] = useState<Lead[]>(() => (isLive ? [] : load(LS.leads, seedLeads)));
  const [projects, setProjects] = useState<Project[]>(() => (isLive ? [] : load(LS.projects, seedProjects)));
  const [audit, setAudit] = useState<AuditEntry[]>(() => (isLive ? [] : load(LS.audit, [])));
  const [session, setSession] = useState<SessionUser | null>(() => (isLive ? null : load(LS.session, null)));
  const [ready, setReady] = useState(!isLive);
  const [syncError, setSyncError] = useState('');
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const fail = useCallback((what: string, err: unknown) => {
    const msg = (err as { message?: string })?.message ?? String(err);
    console.error(what, err);
    setSyncError(`${what}: ${msg}`);
  }, []);

  /* ----- demo mode: keep everything in localStorage ----- */
  useEffect(() => { if (!isLive) save(LS.content, content); }, [content]);
  useEffect(() => { if (!isLive) save(LS.leads, leads); }, [leads]);
  useEffect(() => { if (!isLive) save(LS.projects, projects); }, [projects]);
  useEffect(() => { if (!isLive) save(LS.audit, audit); }, [audit]);
  useEffect(() => { if (!isLive) save(LS.session, session); }, [session]);

  /* ----- live mode: load public website content ----- */
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('site_content').select('content').eq('id', 1).maybeSingle();
      if (cancelled) return;
      if (error) fail('Could not load website content', error);
      else if (data?.content) {
        const merged = withDefaults(data.content as Partial<SiteContent>);
        setContent(merged);
        save(LS.contentCache, merged);
      }
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [fail]);

  /* ----- Meta Pixel (public site) ----- */
  useEffect(() => { if (content.settings.pixelId) initPixel(content.settings.pixelId); }, [content.settings.pixelId]);

  /* ----- live mode: staff data (only works when signed in) ----- */
  const refresh = useCallback(async () => {
    if (!supabase || !sessionRef.current) return;
    const [l, p, a] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('audit_log').select('*').order('at', { ascending: false }).limit(100),
    ]);
    if (l.error) fail('Could not load leads', l.error); else setLeads((l.data ?? []).map(leadFromRow));
    if (p.error) fail('Could not load projects', p.error); else setProjects((p.data ?? []).map(projectFromRow));
    if (!a.error) setAudit((a.data ?? []).map((r) => ({ id: r.id, at: r.at, user: r.user_name, action: r.action })));
  }, [fail]);

  const loadProfile = useCallback(async (userId: string, email: string): Promise<SessionUser | null> => {
    if (!supabase) return null;
    const { data } = await supabase.from('profiles').select('name, role').eq('id', userId).maybeSingle();
    if (!data) return null;
    return { email, name: data.name, role: data.role };
  }, []);

  // Restore an existing login when the page loads.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (u) {
        const prof = await loadProfile(u.id, u.email ?? '');
        if (!cancelled) setSession(prof);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setSession(null);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  useEffect(() => { if (isLive && session) void refresh(); }, [session, refresh]);
  useEffect(() => {
    if (!isLive || !session) return;
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [session, refresh]);

  /* ----- audit log ----- */
  const log = useCallback((user: string, action: string) => {
    if (supabase) {
      void supabase.from('audit_log').insert({ user_name: user, action }).then(({ error }) => { if (error) console.warn('audit', error.message); });
    }
    setAudit((a) => [{ id: crypto.randomUUID(), at: new Date().toISOString(), user, action }, ...a].slice(0, 100));
  }, []);

  /* ----- website content ----- */
  const saveContent = useCallback(async (next: SiteContent, actor?: string, action?: string) => {
    if (supabase) {
      const { error } = await supabase.from('site_content').upsert({ id: 1, content: next, updated_by: actor ?? null, updated_at: new Date().toISOString() });
      if (error) { fail('Could not save website content', error); return error.message; }
      save(LS.contentCache, next);
    }
    setContent(next);
    if (actor) log(actor, action ?? 'Updated website content');
    return null;
  }, [fail, log]);

  const resetContent = useCallback(() => saveContent(defaultContent), [saveContent]);

  /* ----- leads ----- */
  const addLead: Store['addLead'] = useCallback(async (input) => {
    let ref = '';
    if (supabase) {
      // A database function assigns the reference number and checks the price.
      const { data, error } = await supabase.rpc('submit_lead', {
        p: {
          name: input.name, business: input.business, whatsapp: input.whatsapp, email: input.email,
          offerId: input.offerId, offerName: input.offerName, price: input.price,
          industry: input.industry, product: input.product, event: input.event,
          notes: input.notes, utmSource: input.utmSource ?? null,
        },
      });
      if (error || !data) {
        console.error('submit_lead failed', error);
        // Never lose the customer: make up a reference; Make/Google Sheets will still get the lead.
        ref = `AV-W${Date.now().toString(36).slice(-5).toUpperCase()}`;
      } else {
        ref = String(data);
      }
    } else {
      ref = `AV-${++demoRef}`;
    }
    const full: Lead = {
      ...input, id: crypto.randomUUID(), ref, date: new Date().toISOString().slice(0, 10),
      status: 'New', paymentStatus: 'Unpaid',
    };
    if (!isLive) setLeads((ls) => [full, ...ls]);
    sendLeadToMake(full);
    track('Lead', { value: full.price, currency: 'NGN', content_name: full.offerName });
    return full;
  }, []);

  const updateLead = useCallback((id: string, patch: Partial<Lead>, actor?: string) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    if (supabase) {
      void supabase.from('leads').update(leadPatchToRow(patch)).eq('id', id).then(({ error }) => { if (error) fail('Could not update lead', error); });
    }
    if (actor) log(actor, `Updated lead ${patch.status ? `status → ${patch.status}` : patch.paymentStatus ? `payment → ${patch.paymentStatus}` : ''} (${id.slice(0, 6)})`);
  }, [fail, log]);

  const deleteLead = useCallback((id: string) => {
    setLeads((ls) => ls.filter((l) => l.id !== id));
    if (supabase) void supabase.from('leads').delete().eq('id', id).then(({ error }) => { if (error) fail('Could not delete lead', error); });
  }, [fail]);

  /* ----- projects ----- */
  const updateProject = useCallback((id: string, patch: Partial<Project>, actor?: string) => {
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    if (supabase) void supabase.from('projects').update(projectToRow(patch)).eq('id', id).then(({ error }) => { if (error) fail('Could not update project', error); });
    if (actor) log(actor, `Updated project ${id.slice(0, 6)}`);
  }, [fail, log]);

  const addProject: Store['addProject'] = useCallback((p) => {
    if (supabase) {
      void supabase.from('projects').insert(projectToRow(p)).select().single().then(({ data, error }) => {
        if (error) fail('Could not create project', error);
        else if (data) setProjects((ps) => [projectFromRow(data), ...ps]);
      });
    } else {
      setProjects((ps) => [{ ...p, id: crypto.randomUUID(), ref: `PRJ-${++demoRef}` }, ...ps]);
    }
  }, [fail]);

  /* ----- sign in / out ----- */
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const mail = email.trim().toLowerCase();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: mail, password });
      if (error || !data.user) return 'Incorrect email or password.';
      const prof = await loadProfile(data.user.id, mail);
      if (!prof) {
        await supabase.auth.signOut();
        return 'This account is not set up as team staff yet. See README.md, Part 4, step 6.';
      }
      setSession(prof);
      log(prof.name, 'Signed in');
      return null;
    }
    const { DEMO_USERS } = await import('@/content/demoUsers');
    const u = DEMO_USERS.find((x) => x.email === mail && x.password === password);
    if (!u) return 'Incorrect email or password. Try the demo accounts below.';
    setSession({ email: u.email, name: u.name, role: u.role });
    log(u.name, 'Signed in');
    return null;
  }, [loadProfile, log]);

  const signOut = useCallback(() => {
    setSession(null);
    if (supabase) {
      void supabase.auth.signOut();
      setLeads([]); setProjects([]); setAudit([]);
    }
  }, []);

  const value = useMemo<Store>(() => ({
    mode: isLive ? 'live' : 'demo', ready, syncError, clearSyncError: () => setSyncError(''),
    content, saveContent, resetContent,
    leads, addLead, updateLead, deleteLead,
    projects, updateProject, addProject,
    audit, log, session, signIn, signOut, refresh: () => void refresh(),
  }), [ready, syncError, content, saveContent, resetContent, leads, addLead, updateLead, deleteLead, projects, updateProject, addProject, audit, log, session, signIn, signOut, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

export const fmtNaira = (n: number) => '₦' + n.toLocaleString('en-NG');

export function waLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
}

export function ytThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function extractYouTubeId(url: string): string {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,})/);
  return m ? m[1] : url.trim();
}
