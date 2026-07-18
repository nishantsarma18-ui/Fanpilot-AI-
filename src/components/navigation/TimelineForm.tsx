import React from 'react';
import { MapPin, Compass, Loader2 } from 'lucide-react';
import { MatchInfo } from '../../types.js';

interface TimelineFormProps {
  cityMatches: MatchInfo[];
  selectedMatchId: string;
  setSelectedMatchId: (val: string) => void;
  hotelLocation: string;
  setHotelLocation: (val: string) => void;
  transportMode: string;
  setTransportMode: (val: string) => void;
  fanStyle: 'early_bird' | 'balanced' | 'efficient';
  setFanStyle: (val: 'early_bird' | 'balanced' | 'efficient') => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const TimelineForm: React.FC<TimelineFormProps> = ({
  cityMatches,
  selectedMatchId,
  setSelectedMatchId,
  hotelLocation,
  setHotelLocation,
  transportMode,
  setTransportMode,
  fanStyle,
  setFanStyle,
  isLoading,
  onSubmit
}) => {
  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
      <div>
        <h2 className="text-xl font-display font-semibold text-white">Match-Day Timeline Planner</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Generate a custom transit timeline schedule grounded in current local transportation routes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
  );
};

export default TimelineForm;
