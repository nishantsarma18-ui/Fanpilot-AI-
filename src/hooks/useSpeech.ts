import { useState, useCallback, useEffect } from 'react';

export function useSpeech() {
  const [speakingText, setSpeakingText] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const speakText = useCallback((text: string, targetLanguage: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechError('Speech synthesis is not supported in this browser or environment.');
      return;
    }

    setSpeechError(null);

    try {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);

      // Pick language code
      let langCode = 'en-US';
      const loweredLang = targetLanguage.toLowerCase();
      if (loweredLang.includes('spanish') || loweredLang.includes('es')) {
        langCode = 'es-MX';
      } else if (loweredLang.includes('french') || loweredLang.includes('fr')) {
        langCode = 'fr-CA';
      }

      utterance.lang = langCode;
      utterance.rate = 0.85; // slightly slower for better learning

      utterance.onstart = () => {
        setSpeakingText(text);
      };
      utterance.onend = () => {
        setSpeakingText('');
      };
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        setSpeakingText('');
        setSpeechError('Failed playing pronunciation audio. Speech engine error.');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      console.error(err);
      setSpeechError('An unexpected error occurred during speech synthesis.');
      setSpeakingText('');
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingText('');
    }
  }, []);

  const clearSpeechError = useCallback(() => {
    setSpeechError(null);
  }, []);

  // Cancel any running speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speakingText,
    speechError,
    speakText,
    stopSpeaking,
    clearSpeechError
  };
}
export default useSpeech;
