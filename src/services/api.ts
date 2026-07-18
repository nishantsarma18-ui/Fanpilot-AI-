import { ChatMessage, ItineraryItem } from '../types';

export interface TranslationResponse {
  translation: string;
  phonetic: string;
  contextExplanation: string;
  footballTermTip: string;
}

export interface ApiStatusResponse {
  configured: boolean;
  model: string;
  provider: string;
}

/**
 * Fetch the diagnostic status of the Gemini API integration.
 */
export async function fetchApiStatus(): Promise<ApiStatusResponse> {
  const response = await fetch('/api/status');
  if (!response.ok) {
    throw new Error('Failed to fetch api status');
  }
  return response.json();
}

/**
 * Request real-time local dialect translation and cultural context.
 */
export async function translateText(params: {
  text: string;
  sourceLang: string;
  targetLang: string;
  cityId: string;
}): Promise<TranslationResponse> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Translation failed');
  }

  return response.json();
}

/**
 * Generate a personalized World Cup match-day journey timeline.
 */
export async function fetchNavigationTimeline(params: {
  cityId: string;
  stadiumName: string;
  hotelLocation: string;
  transportMode: string;
  matchTime: string;
  fanStyle: string;
}): Promise<ItineraryItem[]> {
  const response = await fetch('/api/navigation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch navigation timeline');
  }

  return response.json();
}

/**
 * Send messages history to the assistant copilot to retrieve smart guidance.
 */
export async function postCopilotMessage(params: {
  messages: ChatMessage[];
  cityId: string;
}): Promise<{ text: string }> {
  const response = await fetch('/api/copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Copilot query failed');
  }

  return response.json();
}
