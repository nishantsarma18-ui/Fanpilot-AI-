import React from 'react';
import { ListChecks } from 'lucide-react';

export const SecurityChecklist: React.FC = () => {
  return (
    <div className="bg-zinc-950 text-slate-100 rounded-2xl p-5 space-y-4 shadow-2xl border border-white/10">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
        <ListChecks size={16} />
        <span>Stadium Pre-Entry Checklist</span>
      </div>
      <ul className="space-y-2.5 text-xs text-zinc-300">
        <li className="flex gap-2">
          <span className="text-emerald-400 font-bold">✓</span>
          <span><strong>Clear Bags Only</strong> (Check size limitations on Host City tab).</span>
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-400 font-bold">✓</span>
          <span><strong>Cashless Payments Only</strong>. Bring debit/credit cards or set up Apple/Google Pay.</span>
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-400 font-bold">✓</span>
          <span><strong>Mobile Tickets Only</strong>. Screenshots are NOT accepted at World Cup turnstiles.</span>
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-400 font-bold">✓</span>
          <span><strong>No External Liquids</strong>. Sealed water bottles or hydration vests are prohibited.</span>
        </li>
      </ul>
    </div>
  );
};

export default SecurityChecklist;
