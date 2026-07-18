import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../../types.js';

interface ChatWindowProps {
  stadiumName: string;
  messages: ChatMessage[];
  inputText: string;
  setInputText: (val: string) => void;
  isLoading: boolean;
  onSubmitMessage: (e: React.FormEvent) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  stadiumName,
  messages,
  inputText,
  setInputText,
  isLoading,
  onSubmitMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
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
            <p className="text-[10px] text-zinc-500 font-mono">{stadiumName} Mode</p>
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

      {/* Chat Footer Input Form */}
      <form onSubmit={onSubmitMessage} className="p-3 bg-zinc-950 border-t border-white/10 flex gap-2">
        <input
          type="text"
          required
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          placeholder={`Ask about bags, parking, light rail, food, or rules at ${stadiumName}...`}
          className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-400 focus:outline-hidden disabled:opacity-60 placeholder:text-zinc-600 font-medium"
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
  );
};

export default ChatWindow;
