import React, { useState } from 'react';
import { phraseCategories, phrasebookData, hostCities, genericEnglishPhrasebook } from '../data';
import { Volume2, Loader2, Sparkles, Send, HelpCircle, Check, Megaphone, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SlangPhrasebookProps {
  selectedCityId: string;
}

export default function SlangPhrasebook({ selectedCityId }: SlangPhrasebookProps) {
  const currentCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];

  const [activeCategory, setActiveCategory] = useState<'matchday' | 'food_drink' | 'transit' | 'chants' | 'emergencies'>('matchday');
  const [customText, setCustomText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState(
    currentCity.country === 'Mexico' ? 'Mexican Spanish' : currentCity.country === 'Canada' ? 'Canadian French' : 'American English'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [aiTranslation, setAiTranslation] = useState<{
    translation: string;
    phonetic: string;
    contextExplanation: string;
    footballTermTip: string;
  } | null>(null);

  const [speakerLang, setSpeakerLang] = useState<string>('');
  const [speechSuccess, setSpeechSuccess] = useState<string | null>(null);

  // Get active phrases
  const cityPhrases = phrasebookData[selectedCityId] || {};
  const activePhrases = cityPhrases[activeCategory] || genericEnglishPhrasebook[activeCategory] || [];

  // Speech synthesis speaker
  const speakText = (text: string, targetLanguage: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);

    // Pick language code
    let langCode = 'en-US';
    if (targetLanguage.toLowerCase().includes('spanish') || targetLanguage.toLowerCase().includes('es')) {
      langCode = 'es-MX';
    } else if (targetLanguage.toLowerCase().includes('french') || targetLanguage.toLowerCase().includes('fr')) {
      langCode = 'fr-CA';
    }

    utterance.lang = langCode;
    utterance.rate = 0.85; // slightly slower for better learning

    utterance.onstart = () => {
      setSpeakerLang(text);
    };
    utterance.onend = () => {
      setSpeakerLang('');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Submit translation to backend
  const handleTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsLoading(true);
    setAiTranslation(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: customText,
          sourceLang,
          targetLang,
          cityId: selectedCityId
        })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setAiTranslation(data);
    } catch (error) {
      console.error(error);
      // fallback handled gracefully
      setAiTranslation({
        translation: customText,
        phonetic: "N/A",
        contextExplanation: "Network error / Offline fallback mode. Ensure you are connected to the internet and your GEMINI_API_KEY is configured in settings.",
        footballTermTip: "Tip: Football is a universal language! Smile, wave your colors, and say thank you!"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'matchday':
        return '🎟️';
      case 'food_drink':
        return '🍔';
      case 'transit':
        return '🚇';
      case 'chants':
        return '📣';
      case 'emergencies':
        return '🚨';
      default:
        return '💬';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="phrasebook-section">
      {/* Phrasebook and Categories */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-white">Football Fan Phrasebook</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Instant match-day phrases grounded in <strong className="text-blue-400 font-semibold">{currentCity.name}</strong> local culture
            </p>
          </div>

          {/* Quick Speak tip */}
          <span className="text-[11px] bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-full flex items-center gap-1.5 self-start">
            <Volume2 size={13} className="text-blue-400" />
            <span>Click speaker to play audio</span>
          </span>
        </div>

        {/* Categories list */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {phraseCategories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-lg'
                    : 'border-white/5 bg-[#0a0a0a] hover:border-white/20 text-white/70'
                }`}
                id={`phrase-cat-${cat.id}`}
              >
                <span className="text-lg" aria-hidden="true">{getCategoryIcon(cat.id)}</span>
                <span className="text-[11px] font-semibold leading-tight line-clamp-1">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Phrase List */}
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
          {activePhrases.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 rounded-xl border border-dashed border-white/10">
              <p className="text-sm text-zinc-400">No pre-loaded phrases for this category.</p>
              <p className="text-xs text-zinc-500 mt-1">Try translating a custom phrase using the AI Coach on the right!</p>
            </div>
          ) : (
            activePhrases.map((phrase, idx) => {
              const isSpeaking = speakerLang === phrase.translation;
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
                    onClick={() => speakText(phrase.translation, currentCity.country === 'Mexico' ? 'Spanish' : 'English')}
                    className={`p-2.5 rounded-full border transition-all flex-shrink-0 ${
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
            })
          )}
        </div>

        {/* Local Slang Vocabulary Coach */}
        <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone className="text-amber-400" size={18} />
            <span className="text-sm font-display font-semibold text-white">Local Slang & Dialect Coach</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentCity.localSlang?.map((slang) => (
              <div key={slang.term} className="bg-zinc-950 p-3 rounded-lg border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 font-mono">"{slang.term}"</span>
                  <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded">
                    {slang.meaning}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">{slang.context}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Custom translation with Gemini */}
      <div className="lg:col-span-5">
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
          <form onSubmit={handleTranslateSubmit} className="space-y-4">
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
                className="w-full bg-[#0a0a0a] border border-white/10 text-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-hidden placeholder:text-zinc-600"
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
                  onClick={() => speakText(aiTranslation.translation, targetLang)}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-[10px] font-semibold uppercase tracking-wider"
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
      </div>
    </div>
  );
}
