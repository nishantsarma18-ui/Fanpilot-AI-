export type TravelPhase = 'pre_arrival' | 'hotel_to_transit' | 'transit_to_stadium' | 'gate_to_seat' | 'inside_stadium' | 'post_match';

export interface HostCity {
  id: string;
  name: string;
  country: 'USA' | 'Mexico' | 'Canada';
  stadium: string;
  stadiumCapacity: string;
  gates: string[];
  transportationTips: string[];
  bagPolicy: string;
  specialities: string[];
  localSlang: { term: string; meaning: string; context: string }[];
}

export interface MatchInfo {
  id: string;
  teamA: string;
  teamAFlag: string;
  teamB: string;
  teamBFlag: string;
  date: string;
  time: string;
  venue: string;
  cityId: string;
}

export interface PhraseCategory {
  id: 'matchday' | 'food_drink' | 'transit' | 'chants' | 'emergencies';
  label: string;
  icon: string;
}

export interface Phrase {
  original: string;
  translation: string;
  phonetic: string;
  context: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  completed: boolean;
  location: string;
  type: 'transit' | 'stadium' | 'social' | 'match';
}

export interface SavedItinerary {
  id: string;
  cityId: string;
  matchId: string;
  hotelLocation: string;
  transportMode: string;
  language: string;
  items: ItineraryItem[];
  created_at: string;
}
