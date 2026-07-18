import React from 'react';
import useItinerary from '../hooks/useItinerary.js';
import TimelineForm from './navigation/TimelineForm.js';
import ItineraryTimeline from './navigation/ItineraryTimeline.js';
import SeatingLocator from './navigation/SeatingLocator.js';
import SecurityChecklist from './navigation/SecurityChecklist.js';

interface MatchNavigationProps {
  selectedCityId: string;
}

export default function MatchNavigation({ selectedCityId }: MatchNavigationProps) {
  const {
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
  } = useItinerary(selectedCityId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="navigation-planner-section">
      {/* Left Form or Active Timeline Plan */}
      <div className="lg:col-span-7 space-y-6">
        {!itinerary ? (
          <TimelineForm
            cityMatches={cityMatches}
            selectedMatchId={selectedMatchId}
            setSelectedMatchId={setSelectedMatchId}
            hotelLocation={hotelLocation}
            setHotelLocation={setHotelLocation}
            transportMode={transportMode}
            setTransportMode={setTransportMode}
            fanStyle={fanStyle}
            setFanStyle={setFanStyle}
            isLoading={isLoading}
            onSubmit={generateTimeline}
          />
        ) : (
          <ItineraryTimeline
            itinerary={itinerary}
            selectedMatch={activeSelectedMatch}
            alarms={alarms}
            onClear={clearItinerary}
            onToggleStep={toggleStepCompleted}
            onToggleAlarm={toggleAlarm}
          />
        )}
      </div>

      {/* Right Seating and Checklist Panels */}
      <div className="lg:col-span-5 space-y-6">
        <SeatingLocator
          sectionNumber={sectionNumber}
          onChangeSection={lookupSection}
          resolvedSeating={resolvedSeating}
        />
        <SecurityChecklist />
      </div>
    </div>
  );
}
