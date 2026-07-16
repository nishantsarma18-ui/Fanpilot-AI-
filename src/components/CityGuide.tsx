import React, { useState } from 'react';
import { hostCities } from '../data';
import { HostCity } from '../types';
import { MapPin, ShieldAlert, Train, Utensils, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CityGuideProps {
  onSelectCity: (cityId: string) => void;
  selectedCityId: string;
}

export default function CityGuide({ onSelectCity, selectedCityId }: CityGuideProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'USA' | 'Mexico' | 'Canada'>('all');

  const filteredCities = hostCities.filter(
    (city) => activeTab === 'all' || city.country === activeTab
  );

  const selectedCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];

  const getCountryFlag = (country: string) => {
    switch (country) {
      case 'USA':
        return '🇺🇸';
      case 'Mexico':
        return '🇲🇽';
      case 'Canada':
        return '🇨🇦';
      default:
        return '⚽';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="city-guide-section">
      {/* Left List of Cities */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-white">Host Cities & Venues</h2>
          <span className="text-xs bg-blue-500/10 text-blue-400 font-bold px-3 py-1 rounded-full border border-blue-500/20 font-mono">
            16 Matches Scheduled
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-[#0a0a0a] p-1.5 rounded-xl border border-white/10 gap-1.5">
          {(['all', 'USA', 'Mexico', 'Canada'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white/10 text-blue-400 font-bold border border-white/10'
                  : 'text-white/50 hover:text-white'
              }`}
              id={`city-tab-${tab}`}
            >
              {tab === 'all' ? 'All' : `${getCountryFlag(tab)} ${tab}`}
            </button>
          ))}
        </div>

        {/* Scrollable List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredCities.map((city) => {
            const isSelected = city.id === selectedCityId;
            return (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={city.id}
                onClick={() => onSelectCity(city.id)}
                className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/5 shadow-md'
                    : 'border-white/5 bg-zinc-950 hover:border-white/20'
                }`}
                id={`city-item-${city.id}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">{getCountryFlag(city.country)}</span>
                    <span className="font-display font-medium text-white text-sm">{city.name}</span>
                    <span className="text-xs text-slate-500">({city.country})</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">{city.stadium}</p>
                </div>
                <div className="flex items-center gap-1 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Right Details Container */}
      <div className="lg:col-span-7">
        <motion.div
          key={selectedCity.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl p-6 space-y-6"
        >
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">{getCountryFlag(selectedCity.country)}</span>
                <h3 className="text-2xl font-serif italic font-light text-white">{selectedCity.name}</h3>
                <span className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                  {selectedCity.country}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">Official Host Stadium Match-Day Guide</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-3 rounded-xl flex items-center gap-3">
              <Users className="text-blue-400" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold font-mono">Stadium Capacity</p>
                <p className="text-sm font-mono font-bold text-white">{selectedCity.stadiumCapacity} Seats</p>
              </div>
            </div>
          </div>

          {/* Stadium Details Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stadium Block */}
            <div className="p-4 bg-[#0a0a0a] rounded-xl space-y-2 border border-white/5">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider font-mono">
                <MapPin size={16} />
                <span>Stadium & Gates</span>
              </div>
              <p className="text-sm font-semibold text-white">{selectedCity.stadium}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCity.gates.map((gate) => (
                  <span key={gate} className="text-[10px] bg-zinc-900 border border-white/10 px-2 py-0.5 rounded-md font-mono text-zinc-300">
                    {gate}
                  </span>
                ))}
              </div>
            </div>

            {/* Bag Policy Block */}
            <div className="p-4 bg-amber-950/20 rounded-xl space-y-2 border border-amber-900/30">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider font-mono">
                <ShieldAlert size={16} />
                <span>Bag Policy & Security</span>
              </div>
              <p className="text-xs text-amber-300 leading-relaxed font-medium">
                {selectedCity.bagPolicy}
              </p>
            </div>
          </div>

          {/* Transportation Tips */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
              <Train className="text-emerald-400" size={18} />
              <span>Intelligent Match-Day Transit Tips</span>
            </h4>
            <ul className="space-y-2.5">
              {selectedCity.transportationTips.map((tip, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-zinc-300 leading-relaxed">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Local Food Specialities */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
              <Utensils className="text-amber-400" size={18} />
              <span>Must-Try Stadium Concessions & Food</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedCity.specialities.map((item) => (
                <div key={item} className="bg-[#0a0a0a] hover:bg-zinc-900 transition-colors border border-white/5 p-3 rounded-xl text-center">
                  <span className="text-xs font-semibold text-white block">{item}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">Local Favorite</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt action to Navigation tab */}
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white">Ready to plan your transit timeline?</p>
              <p className="text-[11px] text-zinc-400">Generate a custom schedule from your hotel to {selectedCity.stadium}.</p>
            </div>
            <button
              onClick={() => onSelectCity(selectedCity.id)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
            >
              <span>Build Timeline</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
