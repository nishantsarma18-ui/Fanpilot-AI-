import React, { useState, useEffect } from 'react';
import { matches, hostCities } from '../data';
import { SavedItinerary, ItineraryItem, MatchInfo } from '../types';
import { MapPin, Compass, Clock, CheckCircle, HelpCircle, Bell, Loader2, ListChecks, ShieldCheck, Ticket } from 'lucide-react';
import { motion } from 'motion/react';

interface MatchNavigationProps {
  selectedCityId: string;
}

export default function MatchNavigation({ selectedCityId }: MatchNavigationProps) {
  const cityMatches = matches.filter((m) => m.cityId === selectedCityId);
  const currentCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];

  const [selectedMatchId, setSelectedMatchId] = useState(cityMatches[0]?.id || matches[0].id);
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
  const handleGenerateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelLocation.trim()) return;

    setIsLoading(true);
    const match = matches.find((m) => m.id === selectedMatchId) || matches[0];

    try {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: selectedCityId,
          stadiumName: currentCity.stadium,
          hotelLocation,
          transportMode,
          matchTime: match.time,
          fanStyle
        })
      });

      if (!response.ok) {
        throw new Error('Timeline generation failed');
      }

      const items: ItineraryItem[] = await response.json();
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
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle step completed
  const handleToggleStep = (stepId: string) => {
    if (!itinerary) return;

    const updatedItems = itinerary.items.map((item) =>
      item.id === stepId ? { ...item, completed: !item.completed } : item
    );

    const updatedItinerary = { ...itinerary, items: updatedItems };
    localStorage.setItem(`itinerary_${selectedCityId}`, JSON.stringify(updatedItinerary));
    setItinerary(updatedItinerary);
  };

  // Clear itinerary
  const handleClearItinerary = () => {
    localStorage.removeItem(`itinerary_${selectedCityId}`);
    setItinerary(null);
    setHotelLocation('');
  };

  // Seating locator helper
  const handleSectionLookup = (val: string) => {
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
  };

  // Toggle alarm simulation
  const toggleAlarm = (stepId: string) => {
    if (alarms.includes(stepId)) {
      setAlarms(alarms.filter((id) => id !== stepId));
    } else {
      setAlarms([...alarms, stepId]);
    }
  };

  const getItineraryTypeIcon = (type: string) => {
    switch (type) {
      case 'transit':
        return <Compass className="text-brand-blue" size={16} />;
      case 'stadium':
        return <ShieldCheck className="text-brand-green" size={16} />;
      case 'social':
        return <MapPin className="text-brand-gold" size={16} />;
      case 'match':
        return <Ticket className="text-red-500" size={16} />;
      default:
        return <Clock className="text-slate-500" size={16} />;
    }
  };

  const selectedMatch = matches.find((m) => m.id === (itinerary?.matchId || selectedMatchId)) || matches[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="navigation-planner-section">
      {/* Left Form / Active Plan */}
      <div className="lg:col-span-7 space-y-6">
        {!itinerary ? (
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div>
              <h2 className="text-xl font-display font-semibold text-white">Match-Day Timeline Planner</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Generate a custom transit timeline schedule grounded in current local transportation routes.
              </p>
            </div>

            <form onSubmit={handleGenerateTimeline} className="space-y-4">
              {/* Select Match */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400">Select World Cup Match</label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-hidden font-medium"
                >
                  {cityMatches.map((match) => (
                    <option key={match.id} value={match.id} className="bg-[#050505] text-white">
                      {match.teamAFlag} {match.teamA} vs {match.teamBFlag} {match.teamB} — {match.date} ({match.time})
                    </option>
                  ))}
                  {cityMatches.length === 0 && (
                    <option disabled className="bg-[#050505] text-white">No matches scheduled for this city</option>
                  )}
                </select>
              </div>

              {/* Start point */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400">Starting Point (Hotel, Landmark, Station)</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                  <input
                    type="text"
                    required
                    value={hotelLocation}
                    onChange={(e) => setHotelLocation(e.target.value)}
                    placeholder="e.g., Downtown Hilton, CDMX / Times Square Hostel"
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-hidden placeholder:text-zinc-600 font-medium"
                  />
                </div>
              </div>

              {/* Transportation Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-400">Transport Method</label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-hidden font-medium"
                  >
                    <option value="Public Transit" className="bg-[#050505]">🚇 Public Metro / Rail</option>
                    <option value="Taxi or Rideshare" className="bg-[#050505]">🚗 Taxi / Uber</option>
                    <option value="Walking" className="bg-[#050505]">🚶 Walking</option>
                    <option value="Cycling" className="bg-[#050505]">🚲 Bicycle Sharing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-400">Fan Timing Style</label>
                  <select
                    value={fanStyle}
                    onChange={(e) => setFanStyle(e.target.value as 'early_bird' | 'balanced' | 'efficient')}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white rounded-xl p-3 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-hidden font-medium"
                  >
                    <option value="balanced" className="bg-[#050505]">⏱️ Balanced (1.5h early)</option>
                    <option value="early_bird" className="bg-[#050505]">🔥 Early Tailgater (4h early)</option>
                    <option value="efficient" className="bg-[#050505]">⚡ Efficient (30m early)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 uppercase tracking-wider"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Planning Transit Corridors...</span>
                  </>
                ) : (
                  <>
                    <Compass size={16} />
                    <span>Generate Match-Day Timeline</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Active Itinerary display list */
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono border border-blue-500/20">
                  Active Transit Plan
                </span>
                <h3 className="text-lg font-serif italic text-white mt-1">
                  {selectedMatch.teamAFlag} vs {selectedMatch.teamBFlag} Match-Day Journey
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Starting from <strong className="text-slate-300">{itinerary.hotelLocation}</strong> via {itinerary.transportMode}
                </p>
              </div>

              <button
                onClick={handleClearItinerary}
                className="text-xs bg-zinc-900 border border-white/10 text-zinc-400 hover:bg-red-950/30 hover:border-red-900/40 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                id="reset-itinerary-btn"
              >
                Reset Route
              </button>
            </div>

            {/* Timeline track list */}
            <div className="relative border-l border-white/10 ml-4 pl-6 space-y-6">
              {itinerary.items.map((item) => {
                const isCompleted = item.completed;
                const hasAlarm = alarms.includes(item.id);

                return (
                  <div key={item.id} className="relative group" id={`itinerary-item-${item.id}`}>
                    {/* Bullet marker */}
                    <button
                      onClick={() => handleToggleStep(item.id)}
                      className={`absolute -left-[37px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                          : 'bg-zinc-950 border-zinc-700 text-transparent hover:border-emerald-500 hover:text-emerald-500/50'
                      }`}
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      <CheckCircle size={14} className={isCompleted ? 'block' : 'opacity-0 group-hover:opacity-100'} />
                    </button>

                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white flex items-center gap-1">
                            <Clock size={13} className="text-zinc-500" />
                            {item.time}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] bg-white/5 px-1.5 py-0.5 rounded font-semibold uppercase text-slate-400 border border-white/5">
                            {getItineraryTypeIcon(item.type)}
                            <span>{item.type}</span>
                          </span>
                        </div>
                        <p className={`text-sm ${isCompleted ? 'text-zinc-500 line-through' : 'text-slate-100 font-medium'}`}>
                          {item.activity}
                        </p>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <MapPin size={12} className="text-zinc-500" />
                          {item.location}
                        </span>
                      </div>

                      {/* Notification Alarm setter */}
                      <button
                        onClick={() => toggleAlarm(item.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          hasAlarm
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-sm'
                            : 'bg-zinc-900/50 border-transparent text-zinc-500 hover:text-white hover:bg-zinc-800'
                        }`}
                        title={hasAlarm ? 'Active notification alert set' : 'Notify me before this step'}
                        id={`alarm-btn-${item.id}`}
                      >
                        <Bell size={15} className={hasAlarm ? 'fill-current animate-bounce' : ''} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Notification Success banner */}
            {alarms.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl flex items-center gap-3">
                <Bell className="text-amber-400 animate-pulse animate-duration-1000" size={18} />
                <div className="text-xs">
                  <p className="font-semibold text-white">{alarms.length} Matchday Reminder Alarms Armed</p>
                  <p className="text-zinc-400">We will trigger visual vibration highlights when your countdown clocks reach transit departures.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Stadium Section Seating and Gate lookup helper */}
      <div className="lg:col-span-5 space-y-6">
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
                onChange={(e) => handleSectionLookup(e.target.value)}
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

        {/* Stadium General Guidelines and Security Check checklist */}
        <div className="bg-zinc-950 text-slate-100 rounded-2xl p-5 space-y-4 shadow-2xl border border-white/10">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
            <ListChecks size={16} />
            <span>Stadium Pre-Entry Checklist</span>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Clear Bags Only</strong> (Check size limitations on Host City tab).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Cashless Payments Only</strong>. Bring debit/credit cards or set up Apple/Google Pay.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Mobile Tickets Only</strong>. Screenshots are NOT accepted at World Cup turnstiles.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>No External Liquids</strong>. Sealed water bottles or hydration vests are prohibited.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
