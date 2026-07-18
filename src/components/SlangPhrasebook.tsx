import React, { useState, useEffect } from 'react';
import { phraseCategories, phrasebookData, hostCities, genericEnglishPhrasebook } from '../data.js';
import { Volume2, Megaphone } from 'lucide-react';
import useSpeech from '../hooks/useSpeech.js';
import { translateText } from '../services/api.js';

import CategoryTabs from './phrasebook/CategoryTabs.js';
import PhraseList from './phrasebook/PhraseList.js';
import TranslationForm from './phrasebook/TranslationForm.js';

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

  const { speakingText, speechError, speakText, clearSpeechError } = useSpeech();

  // Reset target language when selected city country changes to match host defaults
  useEffect(() => {
    const updatedCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];
    setTargetLang(
      updatedCity.country === 'Mexico' ? 'Mexican Spanish' : updatedCity.country === 'Canada' ? 'Canadian French' : 'American English'
    );
    setAiTranslation(null);
  }, [selectedCityId]);

  // Load active phrases from preset knowledge base
  const cityPhrases = phrasebookData[selectedCityId] || {};
  const activePhrases = cityPhrases[activeCategory] || genericEnglishPhrasebook[activeCategory] || [];

  const handleTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsLoading(true);
    setAiTranslation(null);

    try {
      const data = await translateText({
        text: customText,
        sourceLang,
        targetLang,
        cityId: selectedCityId
      });
      setAiTranslation(data);
    } catch (error) {
      console.error('Translation form submission error:', error);
      // Fallback translation result
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

  const speakActiveText = (text: string) => {
    speakText(text, currentCity.country === 'Mexico' ? 'Spanish' : 'English');
  };

  const speakCustomResult = (text: string) => {
    speakText(text, targetLang);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="phrasebook-section">
      {/* Phrasebook and Categories */}
      <div className="lg:col-span-7 space-y-6">
        {speechError && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-xl text-xs flex justify-between items-center">
            <span>⚠️ {speechError}</span>
            <button
              onClick={clearSpeechError}
              className="text-[10px] font-bold underline ml-2 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-white">Football Fan Phrasebook</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Instant match-day phrases grounded in <strong className="text-blue-400 font-semibold">{currentCity.name}</strong> local culture
            </p>
          </div>

          <span className="text-[11px] bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-full flex items-center gap-1.5 self-start">
            <Volume2 size={13} className="text-blue-400" />
            <span>Click speaker to play audio</span>
          </span>
        </div>

        {/* Categories selector tabs */}
        <CategoryTabs
          categories={phraseCategories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Active Phrase List Grid */}
        <PhraseList
          phrases={activePhrases}
          speakingText={speakingText}
          onSpeak={speakActiveText}
        />

        {/* Local Slang Vocabulary Coach details */}
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
        <TranslationForm
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          customText={customText}
          setCustomText={setCustomText}
          isLoading={isLoading}
          onSubmit={handleTranslateSubmit}
          aiTranslation={aiTranslation}
          onSpeakResult={speakCustomResult}
        />
      </div>
    </div>
  );
}
