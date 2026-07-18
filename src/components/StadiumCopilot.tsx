import React from 'react';
import { hostCities } from '../data.js';
import useCopilotChat from '../hooks/useCopilotChat.js';
import QuickPrompts from './copilot/QuickPrompts.js';
import ChatWindow from './copilot/ChatWindow.js';

interface StadiumCopilotProps {
  selectedCityId: string;
}

export default function StadiumCopilot({ selectedCityId }: StadiumCopilotProps) {
  const currentCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];

  const {
    messages,
    inputText,
    setInputText,
    isLoading,
    handleSendMessage
  } = useCopilotChat(selectedCityId);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="copilot-section">
      {/* Quick Action prompts panel */}
      <div className="lg:col-span-4">
        <QuickPrompts
          stadiumName={currentCity.stadium}
          onSelectPrompt={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-8">
        <ChatWindow
          stadiumName={currentCity.stadium}
          messages={messages}
          inputText={inputText}
          setInputText={setInputText}
          isLoading={isLoading}
          onSubmitMessage={handleFormSubmit}
        />
      </div>
    </div>
  );
}
