import React from 'react';
import { Volume2 } from 'lucide-react';
import { Phrase } from '../../types.js';

interface PhraseListProps {
  phrases: Phrase[];
  speakingText: string;
  onSpeak: (text: string) => void;
}

export const PhraseList: React.FC<PhraseListProps> = ({
  phrases,
  speakingText,
  onSpeak
}) => {
  if (phrases.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-950 rounded-xl border border-dashed border-white/10">
        <p className="text-sm text-zinc-400">No pre-loaded phrases for this category.</p>
        <p className="text-xs text-zinc-500 mt-1">Try translating a custom phrase using the AI Coach on the right!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
      {phrases.map((phrase, idx) => {
        const isSpeaking = speakingText === phrase.translation;
        return (
          <div
            key={idx}
            className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 shadow-xs hover:border-white/10 transition-all flex items-start gap-4"
          >
            <div className="flex-1 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Original</span>
              <p className="text-sm font-semibold text-slate-200">{phrase.original}</p>

              <div className="pt-2 border-t border-white/5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">Local</span>
                  {phrase.phonetic !== 'N/A' && (
                    <span className="text-[11px] text-zinc-500 font-mono">[{phrase.phonetic}]</span>
                  )}
                </div>
                <p className="text-base text-blue-400 font-semibold font-serif italic">{phrase.translation}</p>
              </div>

              <p className="text-xs text-zinc-400 mt-2 leading-relaxed italic bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                💡 {phrase.context}
              </p>
            </div>

            <button
              onClick={() => onSpeak(phrase.translation)}
              className={`p-2.5 rounded-full border transition-all flex-shrink-0 cursor-pointer ${
                isSpeaking
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-zinc-900 border-white/10 hover:bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Pronounce phrase"
              id={`speak-btn-${idx}`}
            >
              <Volume2 size={16} className={isSpeaking ? 'animate-pulse' : ''} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PhraseList;
