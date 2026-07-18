import React from 'react';
import { HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SeatingLocatorProps {
  sectionNumber: string;
  onChangeSection: (val: string) => void;
  resolvedSeating: { zone: string; gate: string; tip: string } | null;
}

export const SeatingLocator: React.FC<SeatingLocatorProps> = ({
  sectionNumber,
  onChangeSection,
  resolvedSeating
}) => {
  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
      <div>
        <h3 className="text-lg font-display font-semibold text-white">Section & Gate Locator</h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Enter the section code on your ticket. We'll suggest the closest stadium entry gate and concessions.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">Ticket Section Number</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={sectionNumber}
            onChange={(e) => onChangeSection(e.target.value)}
            placeholder="e.g., 142 or 204 or 310"
            className="flex-1 bg-[#0a0a0a] border border-white/10 text-white rounded-xl px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-blue-400 focus:outline-hidden placeholder:text-zinc-700"
          />
        </div>
      </div>

      {resolvedSeating ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl space-y-3"
        >
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded font-mono font-bold">
              Recommended Gate
            </span>
            <p className="text-sm font-bold text-white font-mono">{resolvedSeating.gate}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-zinc-500 font-medium">Seating Bowl Zone:</p>
            <p className="text-xs font-semibold text-blue-400">{resolvedSeating.zone}</p>
          </div>

          <div className="text-[11px] text-zinc-400 leading-relaxed italic border-t border-white/5 pt-2 flex items-start gap-1.5">
            <span>💡</span>
            <span>{resolvedSeating.tip}</span>
          </div>
        </motion.div>
      ) : (
        <div className="text-center p-6 bg-[#0a0a0a] border border-white/5 rounded-xl">
          <HelpCircle className="mx-auto text-zinc-600 mb-2" size={24} />
          <p className="text-xs text-zinc-500 font-medium">Type a section number above to map your seat zone.</p>
        </div>
      )}
    </div>
  );
};

export default SeatingLocator;
