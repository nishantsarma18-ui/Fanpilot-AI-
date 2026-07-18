import React from 'react';
import { Compass, ShieldCheck, MapPin, Ticket, Clock, CheckCircle, Bell } from 'lucide-react';
import { SavedItinerary, MatchInfo } from '../../types.js';

interface ItineraryTimelineProps {
  itinerary: SavedItinerary;
  selectedMatch: MatchInfo;
  alarms: string[];
  onClear: () => void;
  onToggleStep: (stepId: string) => void;
  onToggleAlarm: (stepId: string) => void;
}

const getItineraryTypeIcon = (type: string) => {
  switch (type) {
    case 'transit':
      return <Compass className="text-blue-400" size={16} />;
    case 'stadium':
      return <ShieldCheck className="text-emerald-400" size={16} />;
    case 'social':
      return <MapPin className="text-amber-400" size={16} />;
    case 'match':
      return <Ticket className="text-red-500" size={16} />;
    default:
      return <Clock className="text-slate-500" size={16} />;
  }
};

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  itinerary,
  selectedMatch,
  alarms,
  onClear,
  onToggleStep,
  onToggleAlarm
}) => {
  return (
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
          onClick={onClear}
          className="text-xs bg-zinc-900 border border-white/10 text-zinc-400 hover:bg-red-950/30 hover:border-red-900/40 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer"
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
                onClick={() => onToggleStep(item.id)}
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
                  onClick={() => onToggleAlarm(item.id)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
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
  );
};

export default ItineraryTimeline;
