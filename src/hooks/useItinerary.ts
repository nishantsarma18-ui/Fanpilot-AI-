import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { matches, hostCities } from '../data.js';
import { SavedItinerary, ItineraryItem, MatchInfo } from '../types.js';
import { fetchNavigationTimeline } from '../services/api.js';

export function useItinerary(selectedCityId: string) {
  const cityMatches = useMemo(() => matches.filter((m) => m.cityId === selectedCityId), [selectedCityId]);
  const currentCity = useMemo(() => hostCities.find((c) => c.id === selectedCityId) || hostCities[0], [selectedCityId]);

  const [selectedMatchId, setSelectedMatchId] = useState(() => cityMatches[0]?.id || matches[0].id);
  const [hotelLocation, setHotelLocation] = useState('');
  const [transportMode, setTransportMode] = useState('Public Transit');
  const [fanStyle, setFanStyle] = useState<'early_bird' | 'balanced' | 'efficient'>('balanced');
  const [isLoading, setIsLoading] = useState(false);

  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [sectionNumber, setSectionNumber] = useState('');
  const [resolvedSeating, setResolvedSeating] = useState<{ zone: string; gate: string; tip: string } | null>(null);
  const [alarms, setAlarms] = useState<string[]>([]); // Array of step IDs with active notifications

  // Sync selectedMatchId when the selected city changes to prevent showing mismatched matches
  useEffect(() => {
    const freshMatches = matches.filter((m) => m.cityId === selectedCityId);
    if (freshMatches.length > 0) {
      setSelectedMatchId(freshMatches[0].id);
    }
  }, [selectedCityId]);

  // Load existing itinerary from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`itinerary_${selectedCityId}`);
    if (saved) {
      try {
        setItinerary(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      setItinerary(null);
    }
  }, [selectedCityId]);

  // Handle generating timeline
  const generateTimeline = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelLocation.trim()) return;

    setIsLoading(true);
    const match = matches.find((m) => m.id === selectedMatchId) || matches[0];

    try {
      const items = await fetchNavigationTimeline({
        cityId: selectedCityId,
        stadiumName: currentCity.stadium,
        hotelLocation,
        transportMode,
        matchTime: match.time,
        fanStyle
      });

      const newItinerary: SavedItinerary = {
        id: `itinerary_${Date.now()}`,
        cityId: selectedCityId,
        matchId: selectedMatchId,
        hotelLocation,
        transportMode,
        language: currentCity.country === 'Mexico' ? 'Spanish' : 'English',
        items,
        created_at: new Date().toISOString()
      };

      localStorage.setItem(`itinerary_${selectedCityId}`, JSON.stringify(newItinerary));
      setItinerary(newItinerary);
    } catch (error) {
      console.error('Failed generating timeline:', error);
    } finally {
      setIsLoading(false);
    }
  }, [hotelLocation, selectedMatchId, selectedCityId, currentCity, transportMode, fanStyle]);

  // Toggle step completed
  const toggleStepCompleted = useCallback((stepId: string) => {
    if (!itinerary) return;

    const updatedItems = itinerary.items.map((item) =>
      item.id === stepId ? { ...item, completed: !item.completed } : item
    );

    const updatedItinerary = { ...itinerary, items: updatedItems };
    localStorage.setItem(`itinerary_${selectedCityId}`, JSON.stringify(updatedItinerary));
    setItinerary(updatedItinerary);
  }, [itinerary, selectedCityId]);

  // Clear itinerary
  const clearItinerary = useCallback(() => {
    localStorage.removeItem(`itinerary_${selectedCityId}`);
    setItinerary(null);
    setHotelLocation('');
  }, [selectedCityId]);

  // Seating locator helper
  const lookupSection = useCallback((val: string) => {
    setSectionNumber(val);
    const num = parseInt(val);
    if (!val || isNaN(num)) {
      setResolvedSeating(null);
      return;
    }

    // Interactive stadium layout mapping simulation
    if (num >= 100 && num <= 115) {
      setResolvedSeating({
        zone: 'Lower East Stand (Premium sideline seats)',
        gate: currentCity.gates[0] || 'Main Gate 1',
        tip: 'Close to prime player benches and premium concession hubs.'
      });
    } else if (num >= 116 && num <= 130) {
      setResolvedSeating({
        zone: 'Lower End supporters zone (Intense fan atmosphere)',
        gate: currentCity.gates[1] || 'Main Gate 2',
        tip: 'Organized chants lead from this stand. Expect flags and continuous singing!'
      });
    } else if (num >= 131 && num <= 149) {
      setResolvedSeating({
        zone: 'Lower West Stand (Press & Suites line)',
        gate: currentCity.gates[2] || 'Main Gate 3',
        tip: 'Best sun coverage during early afternoon kickoff fixtures.'
      });
    } else if (num >= 200 && num <= 299) {
      setResolvedSeating({
        zone: 'Club Level Seating / Mezzanine',
        gate: currentCity.gates[3] || 'VIP Entrance',
        tip: 'Access to premium dining lounges and private restrooms.'
      });
    } else if (num >= 300) {
      setResolvedSeating({
        zone: 'Upper Deck Stand (Panoramic sky views)',
        gate: currentCity.gates[0] || 'Main Gate 1',
        tip: 'Incredible broad perspective of the game. Use the escalator hubs.'
      });
    } else {
      setResolvedSeating({
        zone: 'Stadium Seating Bowl',
        gate: currentCity.gates[0] || 'General Gate A',
        tip: 'Double-check with stadium staff inside the turnstile lines.'
      });
    }
  }, [currentCity]);

  // Toggle alarm simulation
  const toggleAlarm = useCallback((stepId: string) => {
    setAlarms((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  }, []);

  const activeSelectedMatch = useMemo(() => {
    return matches.find((m) => m.id === (itinerary?.matchId || selectedMatchId)) || matches[0];
  }, [itinerary, selectedMatchId]);

  return {
    cityMatches,
    currentCity,
    selectedMatchId,
    setSelectedMatchId,
    hotelLocation,
    setHotelLocation,
    transportMode,
    setTransportMode,
    fanStyle,
    setFanStyle,
    isLoading,
    itinerary,
    sectionNumber,
    resolvedSeating,
    alarms,
    activeSelectedMatch,
    generateTimeline,
    toggleStepCompleted,
    clearItinerary,
    lookupSection,
    toggleAlarm
  };
}

export default useItinerary;
