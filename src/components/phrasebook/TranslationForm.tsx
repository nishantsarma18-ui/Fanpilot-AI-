import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Send, Volume2 } from 'lucide-react';

interface TranslationFormProps {
  sourceLang: string;
  setSourceLang: (val: string) => void;
  targetLang: string;
  setTargetLang: (val: string) => void;
  customText: string;
  setCustomText: (val: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  aiTranslation: {
    translation: string;
    phonetic: string;
    contextExplanation: string;
    footballTermTip: string;
  } | null;
  onSpeakResult: (text: string) => void;
}

export const TranslationForm: React.FC<TranslationFormProps> = ({
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  customText,
  setCustomText,
  isLoading,
  onSubmit,
  aiTranslation,
  onSpeakResult
}) => {
  return (
    <div className="bg-zinc-950 text-slate-100 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden border border-white/10">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>

      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-[0.15em] font-mono">
          <Sparkles size={14} />
          <span>Gemini AI powered</span>
        </div>
        <h3 className="text-lg font-serif italic text-white font-light">Custom Slang & Translation Coach</h3>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Type anything you'd ask a local fan, taxi driver, or steward. We'll translate it with authentic slang.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Your Language</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-hidden"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Italian">Italian</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Local Target</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-hidden"
            >
              <option value="Mexican Spanish">Mexican Spanish 🇲🇽</option>
              <option value="Canadian French">Canadian French 🇨🇦</option>
              <option value="American English">American English 🇺🇸</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Message to translate</label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g., 'Excuse me, is this seat occupied? Let's have a beer!'"
            rows={3}
            className="w-full bg-[#0a0a0a] border border-white/10 text-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-hidden placeholder:text-zinc-600 font-medium"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isLoading || !customText.trim()}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          id="custom-translate-submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>Generating Local Context...</span>
            </>
          ) : (
            <>
              <Send size={13} />
              <span>Translate & Teach Me Slang</span>
            </>
          )}
        </button>
      </form>

      {/* AI Result Panel */}
      {aiTranslation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">AI Coach Pronunciation</span>
            <button
              onClick={() => onSpeakResult(aiTranslation.translation)}
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
            >
              <Volume2 size={12} />
              <span>Listen</span>
            </button>
          </div>

          {/* Translation */}
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 font-mono">Translation:</p>
            <p className="text-base font-semibold text-blue-400 font-serif italic">{aiTranslation.translation}</p>
            {aiTranslation.phonetic !== 'N/A' && (
              <p className="text-[10px] text-zinc-500 font-mono">[{aiTranslation.phonetic}]</p>
            )}
          </div>

          {/* Cultural Context */}
          <div className="space-y-1 bg-zinc-950 p-2.5 rounded-lg border border-white/5 text-[11px] leading-relaxed">
            <p className="text-zinc-400 font-bold font-mono text-[10px] uppercase tracking-wider">💡 Cultural Coach Insight:</p>
            <p className="text-zinc-300">{aiTranslation.contextExplanation}</p>
          </div>

          {/* Matchday Tip */}
          <div className="space-y-1 bg-emerald-500/5 p-2.5 border border-emerald-500/20 rounded-lg text-[11px] leading-relaxed">
            <p className="text-emerald-400 font-bold font-mono text-[10px] uppercase tracking-wider">📣 Fan/Matchday Tip:</p>
            <p className="text-zinc-300">{aiTranslation.footballTermTip}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TranslationForm;
