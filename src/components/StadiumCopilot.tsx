import React, { useState, useRef, useEffect } from 'react';
import { hostCities } from '../data';
import { ChatMessage } from '../types';
import { Send, Sparkles, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface StadiumCopilotProps {
  selectedCityId: string;
}

export default function StadiumCopilot({ selectedCityId }: StadiumCopilotProps) {
  const currentCity = hostCities.find((c) => c.id === selectedCityId) || hostCities[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hi! I'm your FanPilot AI companion for **${currentCity.stadium}** in ${currentCity.name}. ⚽\n\nAsk me anything about matchday transit, security bag policies, local delicacies inside the concourses, or emergency contact procedures! How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle city change, reset chat welcome
  useEffect(() => {
    setMessages([
      {
        id: `welcome_${selectedCityId}`,
        sender: 'assistant',
        text: `Hi! I'm your FanPilot AI companion for **${currentCity.stadium}** in ${currentCity.name}. ⚽\n\nAsk me anything about matchday transit, security bag policies, local delicacies inside the concourses, or emergency contact procedures! How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [selectedCityId]);

  // Handle message sending
  const handleSendMessage = async (textToSend: string) => {
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
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          cityId: selectedCityId
        })
      });

      if (!response.ok) {
        throw new Error('Copilot response failed');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: `Sorry, I'm having trouble retrieving details for ${currentCity.stadium} right now. Please ensure your internet connection and GEMINI_API_KEY are configured. Remember that clear bags (12x6x12 inches) are universally required, stadiums are cashless, and arriving 2.5 hours early is highly recommended!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Quick action prompts
  const quickPrompts = [
    { label: '🎒 Clear Bag Rules', prompt: 'What is the clear bag policy and can I bring backpacks?' },
    { label: '🚇 Transit Directions', prompt: `How do I get to ${currentCity.stadium} using public transit?` },
    { label: '🌮 Local Concessions', prompt: 'What local food specialties are served inside the stadium?' },
    { label: '🚨 Safety & Medical', prompt: 'Who do I contact in case of an emergency or lost item?' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="copilot-section">
      {/* Quick Action prompts panel */}
      <div className="lg:col-span-4 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-display font-semibold text-white">Matchday Assist Desk</h3>
          <p className="text-xs text-zinc-400">
            Click any quick-topic card to instantly ask FanPilot AI about stadium regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {quickPrompts.map((qp) => (
            <button
              key={qp.label}
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={isLoading}
              className="w-full text-left p-4 rounded-xl border border-white/5 bg-[#0a0a0a] hover:border-blue-500/30 hover:bg-blue-950/10 transition-all flex items-center justify-between group disabled:opacity-50 cursor-pointer"
              id={`quick-prompt-${qp.label.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
                {qp.label}
              </span>
              <ArrowRight size={14} className="text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        {/* Local Grounding Warning */}
        <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl text-[11px] leading-relaxed text-zinc-400">
          <p className="font-semibold text-white mb-1">💡 Real-time Verified Knowledge</p>
          Our assistant is pre-grounded in specific stadium guidelines, local transport schedules, transit hubs, and security laws for the 2026 World Cup venues.
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-8">
        <div className="bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#050505] text-slate-100 p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold font-display text-sm text-white">
                FP
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-semibold text-sm text-white">FanPilot AI Copilot</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">{currentCity.stadium} Mode</p>
              </div>
            </div>
            <span className="text-[10px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
              <Sparkles size={11} className="text-amber-400" />
              <span>Grounded AI</span>
            </span>
          </div>

          {/* Chat Bubble List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#070707]">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} items-end gap-2`}
                  id={`chat-msg-${msg.id}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      FP
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg ${
                      isAssistant
                        ? 'bg-[#0c0c0c] border border-white/5 text-slate-100 rounded-bl-none'
                        : 'bg-blue-600 text-white rounded-br-none font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1.5 ${
                        isAssistant ? 'text-zinc-500' : 'text-blue-200'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  FP
                </div>
                <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-xs text-zinc-400 shadow-md">
                  <Loader2 className="animate-spin text-blue-400" size={14} />
                  <span>Consulting stadium playbook...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer Input */}
          <form onSubmit={handleFormSubmit} className="p-3 bg-zinc-950 border-t border-white/10 flex gap-2">
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={`Ask about bags, parking, light rail, food, or rules at ${currentCity.stadium}...`}
              className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-400 focus:outline-hidden disabled:opacity-60 placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="send-message-submit"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
