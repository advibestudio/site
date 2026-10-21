import { useMemo, useState } from 'react';
import { MessageCircle, Search, Trash2, ArrowRightCircle } from 'lucide-react';
import { useStore, fmtNaira, waLink } from '@/lib/store';
import type { Lead, LeadStatus, ProjectStatus } from '@/content/types';

const LEAD_STATUSES: (LeadStatus | 'All')[] = ['All', 'New', 'Contacted', 'Qualified', 'Won', 'Lost'];
const PROJECT_STATUSES: ProjectStatus[] = ['Briefing', 'In production', 'Review', 'Revision', 'Delivered', 'Closed'];

const statusColor: Record<string, string> = {
  New: 'bg-[#f5a524]/15 text-[#f5a524]',
  Contacted: 'bg-sky-500/15 text-sky-300',
  Qualified: 'bg-emerald-500/15 text-emerald-300',
  Won: 'bg-emerald-500/25 text-emerald-200',
  Lost: 'bg-white/10 text-white/40',
};

export function LeadsView() {
  const { leads, updateLead, deleteLead, addProject, session, content } = useStore();
  const [filter, setFilter] = useState<(typeof LEAD_STATUSES)[number]>('All');
  const [q, setQ] = useState('');
  const list = useMemo(
    () => leads.filter((l) =>
      (filter === 'All' || l.status === filter) &&
      (q === '' || `${l.name} ${l.business} ${l.ref}`.toLowerCase().includes(q.toLowerCase()))),
    [leads, filter, q],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">Leads</h1>
          <p className="mt-1 text-sm text-white/50">{leads.filter((l) => l.status === 'New').length} new · {leads.length} total. Order-form submissions land here instantly.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads"
            className="min-h-[44px] w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/35 focus:border-[#f5a524] focus:outline-none sm:w-56" />
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {LEAD_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`min-h-[40px] shrink-0 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition ${filter === s ? 'border-[#f5a524] bg-[#f5a524] text-black' : 'border-white/15 text-white/55 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/15 p-10 text-center text-white/45">No leads here yet. Share your site link — submissions from the order form appear here.</p>
      )}

      <div className="space-y-3">
        {list.map((l) => (
          <div key={l.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg uppercase text-white">{l.business} <span className="font-mono text-xs normal-case text-white/35">{l.ref}</span></p>
                <p className="text-sm text-white/55">{l.name} · {l.whatsapp}{l.email ? ` · ${l.email}` : ''}</p>
                <p className="mt-1 text-sm text-white/70">{l.offerName} — <span className="font-semibold text-[#f5a524]">{fmtNaira(l.price)}</span></p>
                <p className="mt-1 text-xs text-white/40">{l.industry} · selling: {l.product} · event: {l.event} · {l.date}{l.utmSource ? ` · via ${l.utmSource}` : ''}</p>
                {l.notes && <p className="mt-2 rounded-lg bg-white/5 p-2.5 text-xs text-white/55">“{l.notes}”</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusColor[l.status]}`}>{l.status}</span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${l.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : l.paymentStatus === 'Deposit' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/45'}`}>{l.paymentStatus}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
              <select value={l.status} onChange={(e) => updateLead(l.id, { status: e.target.value as LeadStatus }, session?.name)}
                className="min-h-[40px] rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white focus:border-[#f5a524] focus:outline-none" aria-label="Lead status">
                {LEAD_STATUSES.slice(1).map((s) => <option key={s} value={s} className="bg-neutral-900">{s}</option>)}
              </select>
              <select value={l.paymentStatus} onChange={(e) => updateLead(l.id, { paymentStatus: e.target.value as Lead['paymentStatus'] }, session?.name)}
                className="min-h-[40px] rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white focus:border-[#f5a524] focus:outline-none" aria-label="Payment status">
                {['Unpaid', 'Deposit', 'Paid'].map((s) => <option key={s} value={s} className="bg-neutral-900">{s}</option>)}
              </select>
              <a href={waLink(l.whatsapp, `Hi ${l.name}, this is ${content.settings.whatsappDisplay} about your order ${l.ref} (${l.offerName}).`)}
                target="_blank" rel="noreferrer"
                className="flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/10">
                <MessageCircle className="h-3.5 w-3.5 text-[#f5a524]" /> WhatsApp
              </a>
              <button
                onClick={() => addProject({ client: l.business, contact: l.name, whatsapp: l.whatsapp, packageName: l.offerName, videosTotal: 1, videosDone: 0, status: 'Briefing', payment: l.paymentStatus, startedUnpaid: false, deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), assigned: session?.name ?? '' })}
                className="flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/10">
                <ArrowRightCircle className="h-3.5 w-3.5 text-[#f5a524]" /> Convert to project
              </button>
              <button onClick={() => deleteLead(l.id)} className="grid h-10 w-10 place-items-center rounded-lg text-white/35 transition hover:bg-red-500/10 hover:text-red-300" aria-label={`Delete lead ${l.business}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectsView() {
  const { projects, updateProject, session, content } = useStore();
  const [q, setQ] = useState('');
  const list = projects.filter((p) => q === '' || `${p.client} ${p.ref}`.toLowerCase().includes(q.toLowerCase()));
  const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">Clients & Projects</h1>
          <p className="mt-1 text-sm text-white/50">{projects.filter((p) => p.status !== 'Closed').length} active · deadlines, payments and revisions in one place.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects"
            className="min-h-[44px] w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-white/35 focus:border-[#f5a524] focus:outline-none sm:w-56" />
        </div>
      </div>

      <div className="space-y-3">
        {list.map((p) => {
          const dl = daysLeft(p.deadline);
          const pct = Math.round((p.videosDone / Math.max(1, p.videosTotal)) * 100);
          return (
            <div key={p.id} className={`rounded-xl border p-5 ${p.startedUnpaid && p.payment !== 'Paid' ? 'border-amber-500/50 bg-amber-500/[0.06]' : dl < 0 && p.status !== 'Closed' ? 'border-red-500/40 bg-red-500/[0.05]' : 'border-white/10 bg-white/[0.03]'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg uppercase text-white">{p.client} <span className="font-mono text-xs normal-case text-white/35">{p.ref}</span></p>
                  <p className="text-sm text-white/55">{p.packageName} · {p.contact} · assigned to {p.assigned}</p>
                </div>
                <div className="text-right">
                  <p className={`font-display text-lg ${dl < 0 && p.status !== 'Closed' ? 'text-red-300' : dl <= 2 ? 'text-amber-300' : 'text-white'}`}>
                    {p.status === 'Closed' ? 'Done' : dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Due today' : `${dl}d left`}
                  </p>
                  <p className="text-xs text-white/40">due {new Date(p.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/45"><span>{p.videosDone} of {p.videosTotal} videos</span><span>{pct}%</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#f5a524] transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {p.startedUnpaid && p.payment !== 'Paid' && (
                <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">Started before payment — approved by {p.approvedBy}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                <select value={p.status} onChange={(e) => updateProject(p.id, { status: e.target.value as ProjectStatus }, session?.name)}
                  className="min-h-[40px] rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white focus:border-[#f5a524] focus:outline-none" aria-label="Project status">
                  {PROJECT_STATUSES.map((s) => <option key={s} value={s} className="bg-neutral-900">{s}</option>)}
                </select>
                <select value={p.payment} onChange={(e) => updateProject(p.id, { payment: e.target.value as typeof p.payment }, session?.name)}
                  className="min-h-[40px] rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white focus:border-[#f5a524] focus:outline-none" aria-label="Payment">
                  {['Unpaid', 'Deposit', 'Paid'].map((s) => <option key={s} value={s} className="bg-neutral-900">{s}</option>)}
                </select>
                <label className="flex items-center gap-2 text-xs text-white/55">
                  Deadline
                  <input type="date" value={p.deadline} onChange={(e) => updateProject(p.id, { deadline: e.target.value }, session?.name)}
                    className="min-h-[40px] rounded-lg border border-white/15 bg-white/5 px-2 text-xs text-white [color-scheme:dark] focus:border-[#f5a524] focus:outline-none" />
                </label>
                <button onClick={() => updateProject(p.id, { videosDone: Math.min(p.videosTotal, p.videosDone + 1) }, session?.name)}
                  className="min-h-[40px] rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/10">
                  +1 video done
                </button>
                <a href={waLink(p.whatsapp, `Hi ${p.contact}, update from ${content.settings.whatsappDisplay} on ${p.ref}: status is now "${p.status}".`)}
                  target="_blank" rel="noreferrer"
                  className="flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/10">
                  <MessageCircle className="h-3.5 w-3.5 text-[#f5a524]" /> WhatsApp client
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
