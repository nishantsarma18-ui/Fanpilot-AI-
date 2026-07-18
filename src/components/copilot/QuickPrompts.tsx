import React from 'react';
import { ArrowRight } from 'lucide-react';

interface QuickPromptsProps {
  stadiumName: string;
  onSelectPrompt: (prompt: string) => void;
  isLoading: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  stadiumName,
  onSelectPrompt,
  isLoading
}) => {
  const quickPrompts = [
    { label: '🎒 Clear Bag Rules', prompt: 'What is the clear bag policy and can I bring backpacks?' },
    { label: '🚇 Transit Directions', prompt: `How do I get to ${stadiumName} using public transit?` },
    { label: '🌮 Local Concessions', prompt: 'What local food specialties are served inside the stadium?' },
    { label: '🚨 Safety & Medical', prompt: 'Who do I contact in case of an emergency or lost item?' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-display font-semibold text-white">Matchday Assist Desk</h3>
        <p className="text-xs text-zinc-400">
          Click any quick-topic card to instantly ask FanPilot AI about stadium regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {quickPrompts.map((qp) => (
          <button
            key={qp.label}
            onClick={() => onSelectPrompt(qp.prompt)}
            disabled={isLoading}
            className="w-full text-left p-4 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-blue-500/30 hover:bg-blue-950/10 transition-all flex items-center justify-between group disabled:opacity-50 cursor-pointer"
            id={`quick-prompt-${qp.label.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
              {qp.label}
            </span>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      {/* Grounding Context Note */}
      <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl text-[11px] leading-relaxed text-zinc-400">
        <p className="font-semibold text-white mb-1">💡 Real-time Verified Knowledge</p>
        Our assistant is pre-grounded in specific stadium guidelines, local transport schedules, transit hubs, and security laws for the 2026 World Cup venues.
      </div>
    </div>
  );
};

export default QuickPrompts;
