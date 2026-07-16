import React, { useState, useEffect } from 'react';
import { hostCities } from './data';
import CityGuide from './components/CityGuide';
import SlangPhrasebook from './components/SlangPhrasebook';
import MatchNavigation from './components/MatchNavigation';
import StadiumCopilot from './components/StadiumCopilot';
import { Compass, MessageSquare, BookOpen, MapPin, Sparkles, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [selectedCityId, setSelectedCityId] = useState<string>('mexico_city');
  const [activeTab, setActiveTab] = useState<'cities' | 'language' | 'navigation' | 'copilot'>('cities');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('fanpilot_theme') as 'dark' | 'light') || 'dark';
  });

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('fanpilot_theme', newTheme);
  };

  // Load selected city from localStorage if saved
  useEffect(() => {
    const savedCity = localStorage.getItem('fanpilot_selected_city');
    if (savedCity) {
      // check if valid
      if (hostCities.some((c) => c.id === savedCity)) {
        setSelectedCityId(savedCity);
      }
    }
  }, []);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    localStorage.setItem('fanpilot_selected_city', cityId);
  };

  const currentCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];

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
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col" id="app-container">
      {/* Top Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-400"></div>

      {/* Main Navigation Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/10 text-white font-black font-display text-lg tracking-wider">
                FP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-light tracking-[0.2em] uppercase text-white">
                    FanPilot <span className="font-bold text-blue-400">AI</span>
                  </h1>
                  <span className="text-[9px] bg-white/5 border border-white/10 text-slate-300 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                    2026 World Cup
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  Intelligent Multilingual & Navigation Companion
                </p>
              </div>
            </div>

            {/* Dynamic controls: Selector & Theme Toggle */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              {/* Dynamic context selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold px-2 font-mono">
                  <MapPin size={14} className="text-blue-400" />
                  <span>LIVE HOST CITY:</span>
                </div>
                <select
                  value={selectedCityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="bg-zinc-900 border border-white/10 text-xs font-semibold text-white rounded-xl p-2 focus:ring-1 focus:ring-blue-400 focus:outline-hidden cursor-pointer"
                  id="header-city-selector"
                >
                  {hostCities.map((city) => (
                    <option key={city.id} value={city.id} className="bg-[#0a0a0a] text-slate-100">
                      {getCountryFlag(city.country)} {city.name} ({city.stadium})
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                id="theme-toggle-btn"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={15} className="text-amber-400" />
                ) : (
                  <Moon size={15} className="text-blue-500" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Alert Context */}
        <div className="bg-[#0a0a0a] text-slate-100 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="space-y-1.5 relative z-10 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">{getCountryFlag(currentCity.country)}</span>
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-blue-400 uppercase">
                Active Stadium Location: {currentCity.name}
              </span>
            </div>
            <h2 className="text-2xl font-serif italic font-light text-white leading-tight">
              Navigating {currentCity.stadium}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We've loaded local dialect guides, transport corridors, clear bag policies, and stadium security coordinates for {currentCity.name}. Toggle tabs below to organize your journey!
            </p>
          </div>

          <div className="flex-shrink-0 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center gap-3 relative z-10">
            <ShieldCheck className="text-emerald-400 flex-shrink-0" size={24} />
            <div className="text-xs">
              <p className="font-bold text-white uppercase tracking-wider font-mono">Tournament Emergency Helpline</p>
              <p className="text-emerald-400 font-mono mt-0.5">
                {currentCity.country === 'Mexico' ? 'Dial 911 or 066' : 'Dial 911 (Toll-Free)'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Tab bar switcher */}
        <div className="flex border-b border-white/10 gap-6 overflow-x-auto pb-px custom-scrollbar" role="tablist" aria-label="App Navigation">
          {[
            { id: 'cities', label: 'Host Cities & Stadiums', icon: <MapPin size={15} /> },
            { id: 'language', label: 'Language & Slang Coach', icon: <BookOpen size={15} /> },
            { id: 'navigation', label: 'Match Navigation Router', icon: <Compass size={15} /> },
            { id: 'copilot', label: 'Stadium Copilot Chat', icon: <MessageSquare size={15} /> }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`${tab.id}-tab-panel`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as 'cities' | 'language' | 'navigation' | 'copilot')}
                className={`flex items-center gap-2 pb-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panel Content */}
        <div className="min-h-[450px]">
          {activeTab === 'cities' && (
            <div role="tabpanel" id="cities-tab-panel" aria-labelledby="tab-cities">
              <CityGuide onSelectCity={handleCityChange} selectedCityId={selectedCityId} />
            </div>
          )}
          {activeTab === 'language' && (
            <div role="tabpanel" id="language-tab-panel" aria-labelledby="tab-language">
              <SlangPhrasebook selectedCityId={selectedCityId} />
            </div>
          )}
          {activeTab === 'navigation' && (
            <div role="tabpanel" id="navigation-tab-panel" aria-labelledby="tab-navigation">
              <MatchNavigation selectedCityId={selectedCityId} />
            </div>
          )}
          {activeTab === 'copilot' && (
            <div role="tabpanel" id="copilot-tab-panel" aria-labelledby="tab-copilot">
              <StadiumCopilot selectedCityId={selectedCityId} />
            </div>
          )}
        </div>

      </main>

      {/* Premium Footer */}
      <footer className="bg-black border-t border-white/10 py-8 mt-12 text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">
            ⚽ FanPilot AI — The Elite 2026 Football Fan Companion
          </p>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Intelligently solving language barriers and stadium navigation. Powered securely by Gemini 3.5.
          </p>
          <p className="text-[10px] text-zinc-600 max-w-xl mx-auto italic">
            This independent travel application is designed for international supporters. It has no affiliation with FIFA or official stadium operators.
          </p>
        </div>
      </footer>
    </div>
  );
}
