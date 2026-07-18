import { useState, useEffect, useCallback } from 'react';
import { hostCities } from '../data.js';
import { ChatMessage } from '../types.js';
import { postCopilotMessage } from '../services/api.js';

export function useCopilotChat(selectedCityId: string) {
  const currentCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];

  const getWelcomeMessage = useCallback((cityId: string, stadium: string, cityName: string): ChatMessage => ({
    id: `welcome_${cityId}`,
    sender: 'assistant',
    text: `Hi! I'm your FanPilot AI companion for **${stadium}** in ${cityName}. ⚽\n\nAsk me anything about matchday transit, security bag policies, local delicacies inside the concourses, or emergency contact procedures! How can I help you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }), []);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    getWelcomeMessage(selectedCityId, currentCity.stadium, currentCity.name)
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // When city changes, reset messages history to the welcoming prompt
  useEffect(() => {
    const updatedCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];
    setMessages([
      getWelcomeMessage(selectedCityId, updatedCity.stadium, updatedCity.name)
    ]);
  }, [selectedCityId, getWelcomeMessage]);

  const handleSendMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const data = await postCopilotMessage({
        messages: [...messages, userMessage],
        cityId: selectedCityId
      });

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Copilot API error:', error);
      const updatedCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: `Sorry, I'm having trouble retrieving details for ${updatedCity.stadium} right now. Please ensure your internet connection and GEMINI_API_KEY are configured. Remember that clear bags (12x6x12 inches) are universally required, stadiums are cashless, and arriving 2.5 hours early is highly recommended!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, selectedCityId, isLoading]);

  return {
    messages,
    inputText,
    setInputText,
    isLoading,
    handleSendMessage
  };
}

export default useCopilotChat;
