import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, FolderKanban, Globe, LogOut, ExternalLink,
  AlertTriangle, Clock, TrendingUp, Wallet, Lock,
} from 'lucide-react';
import { useStore, fmtNaira } from '@/lib/store';
import { LeadsView, ProjectsView } from './LeadsProjects';
import { ContentView } from './Content';

type View = 'dashboard' | 'leads' | 'projects' | 'content';

/* ---------- SIGN IN ---------- */
function SignIn() {
  const { signIn, mode } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
  };
  const inputCls = 'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-white/35 focus:border-[#f5a524] focus:outline-none';
  return (
    <div className="grid min-h-dvh place-items-center bg-[#0b0b0c] px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121214] p-8">
        <p className="font-display text-2xl tracking-tight text-white">AdVibe<span className="text-[#f5a524]">.</span></p>
        <p className="mt-1 flex items-center gap-2 text-sm text-white/50"><Lock className="h-3.5 w-3.5" /> Admin sign-in</p>
        <div className="mt-7 space-y-4">
          <input className={inputCls} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" autoComplete="username" />
          <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="mt-6 min-h-[52px] w-full rounded-xl bg-[#f5a524] font-display text-sm uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        {mode === 'demo' && (
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white/45">
            <p className="font-semibold text-white/60">Demo mode — not connected to a database</p>
            <p>Owner: owner@advibe.studio / owner2026</p>
            <p>Operations: ops@advibe.studio / ops2026</p>
            <p className="mt-1">Anything you do here stays in this browser only.</p>
          </div>
        )}
        <a href="#/" className="mt-4 block text-center text-xs text-white/40 transition hover:text-white/70">← Back to website</a>
      </form>
    </div>
  );
}

/* ---------- DASHBOARD ---------- */
function Dashboard({ go }: { go: (v: View) => void }) {
  const { leads, projects, audit, session } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const inWeek = (d: string) => {
    const diff = (new Date(d).getTime() - Date.now()) / 86400000;
    return diff >= -1 && diff <= 7;
  };
  const stats = [
    { label: 'New leads today', value: String(leads.filter((l) => l.date === today).length), icon: TrendingUp, action: () => go('leads') },
    { label: 'Total leads', value: String(leads.length), icon: Users, action: () => go('leads') },
    { label: 'Due this week', value: String(projects.filter((p) => p.status !== 'Closed' && inWeek(p.deadline)).length), icon: Clock, action: () => go('projects') },
    { label: 'Revenue (won/paid)', value: fmtNaira(leads.filter((l) => l.paymentStatus === 'Paid').reduce((s, l) => s + l.price, 0)), icon: Wallet, action: () => go('leads') },
  ];
  const overdue = projects.filter((p) => p.status !== 'Closed' && new Date(p.deadline) < new Date());
  const unpaidStarted = projects.filter((p) => p.startedUnpaid && p.payment !== 'Paid');
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">Good to see you, {session?.name.split(' ')[0]}.</h1>
        <p className="mt-1 text-sm text-white/50">Here is what needs attention today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <button key={s.label} onClick={s.action} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#f5a524]/50">
            <s.icon className="h-5 w-5 text-[#f5a524]" />
            <p className="mt-3 font-display text-2xl text-white">{s.value}</p>
            <p className="text-xs uppercase tracking-widest text-white/45">{s.label}</p>
          </button>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5">
          <p className="flex items-center gap-2 font-display uppercase text-red-300"><AlertTriangle className="h-4 w-4" /> Overdue</p>
          {overdue.map((p) => (
            <p key={p.id} className="mt-2 text-sm text-red-200/80">{p.client} — {p.videosTotal - p.videosDone} video(s) left · was due {new Date(p.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
          ))}
        </div>
      )}
      {unpaidStarted.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
          <p className="flex items-center gap-2 font-display uppercase text-amber-300"><AlertTriangle className="h-4 w-4" /> Started before payment</p>
          {unpaidStarted.map((p) => (
            <p key={p.id} className="mt-2 text-sm text-amber-200/80">{p.client} — {p.packageName} · approved by {p.approvedBy}</p>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display uppercase text-white">Latest leads</p>
            <button onClick={() => go('leads')} className="text-xs font-semibold text-[#f5a524] hover:underline">View all</button>
          </div>
          {leads.slice(0, 5).map((l) => (
            <div key={l.id} className="flex items-center justify-between border-t border-white/5 py-3 text-sm">
              <div>
                <p className="font-semibold text-white">{l.business}</p>
                <p className="text-xs text-white/45">{l.offerName} · {l.ref}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${l.status === 'New' ? 'bg-[#f5a524]/15 text-[#f5a524]' : 'bg-white/10 text-white/60'}`}>{l.status}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-4 font-display uppercase text-white">Activity log</p>
          {audit.length === 0 && <p className="text-sm text-white/40">No activity yet. Edits and status changes will appear here with who made them.</p>}
          {audit.slice(0, 6).map((a) => (
            <div key={a.id} className="border-t border-white/5 py-2.5 text-sm">
              <p className="text-white/75">{a.action}</p>
              <p className="text-xs text-white/40">{a.user} · {new Date(a.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- ADMIN SHELL ---------- */
export default function Admin() {
  const { session, signOut, mode, syncError, clearSyncError, staffReady, initStaff } = useStore();
  const [view, setView] = useState<View>('dashboard');
  // Starts the (lazy) connection to Supabase and restores an existing login.
  useEffect(() => { initStaff(); }, [initStaff]);
  const tabs = useMemo(() => {
    const t: { id: View; label: string; icon: React.ElementType }[] = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'leads', label: 'Leads', icon: Users },
      { id: 'projects', label: 'Clients & Projects', icon: FolderKanban },
      { id: 'content', label: 'Website', icon: Globe },
    ];
    return t;
  }, []);

  if (!staffReady) {
    return <div className="grid min-h-dvh place-items-center bg-[#0b0b0c] text-sm text-white/50">Connecting…</div>;
  }
  if (!session) return <SignIn />;

  return (
    <div className="min-h-dvh bg-[#0b0b0c] text-white md:flex">
      {/* sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 p-5 md:flex">
        <p className="font-display text-lg tracking-tight">AdVibe<span className="text-[#f5a524]">.</span> <span className="text-[10px] text-white/40">ADMIN</span></p>
        <nav className="mt-8 flex-1 space-y-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${view === t.id ? 'bg-[#f5a524]/15 text-[#f5a524]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <a href="#/" className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/50 transition hover:text-white">
          <ExternalLink className="h-4 w-4" /> View on site
        </a>
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm font-semibold">{session.name}</p>
          <p className="text-xs capitalize text-white/40">{session.role === 'owner' ? 'Owner · Super admin' : 'Operations admin'}</p>
          <button onClick={signOut} className="mt-3 flex items-center gap-2 text-sm text-white/50 transition hover:text-red-300">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 px-4 pb-28 pt-6 sm:px-8 md:pb-10">
        <div className="mx-auto max-w-5xl">
          {mode === 'demo' && (
            <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
              <strong>Demo mode.</strong> This site isn't connected to Supabase yet, so everything you change here is saved only in this browser — real customers' orders will NOT appear here. Follow README.md (Part 4) to go live.
            </div>
          )}
          {syncError && (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              <p><strong>Something didn't save.</strong> {syncError}</p>
              <button onClick={clearSyncError} className="shrink-0 text-xs font-bold uppercase tracking-wider text-red-300 hover:text-white">Dismiss</button>
            </div>
          )}
          {view === 'dashboard' && <Dashboard go={setView} />}
          {view === 'leads' && <LeadsView />}
          {view === 'projects' && <ProjectsView />}
          {view === 'content' && <ContentView role={session.role} actor={session.name} />}
        </div>
      </main>

      {/* bottom tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-[#0b0b0c]/95 backdrop-blur-md md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)}
            className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${view === t.id ? 'text-[#f5a524]' : 'text-white/50'}`}>
            <t.icon className="h-5 w-5" /> {t.label.split(' ')[0]}
          </button>
        ))}
        <a href="#/" className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-white/50">
          <ExternalLink className="h-5 w-5" /> Site
        </a>
        <button onClick={signOut} className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-white/50" aria-label="Sign out">
          <LogOut className="h-5 w-5" /> Out
        </button>
      </nav>
    </div>
  );
}
