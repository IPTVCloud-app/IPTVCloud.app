"use client";

import { MessageSquare, X, Send } from "lucide-react";
import { useState } from "react";

type MobileLiveChatProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileLiveChat({ isOpen, onClose }: MobileLiveChatProps) {
  const [messages, setMessages] = useState([
    { id: 1, user: "Alice", text: "Is the stream lagging for anyone else?" },
    { id: 2, user: "Bob", text: "Looks fine here." },
    { id: 3, user: "Charlie", text: "What an amazing play!" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), user: "You", text: input }]);
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col transform transition-transform duration-300 translate-x-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-white/90">
          <MessageSquare className="w-4 h-4" />
          <h3 className="font-medium text-sm">Live Chat</h3>
        </div>
        <button onClick={onClose} className="p-1 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className="text-sm">
            <span className="font-semibold text-white/60 mr-2">{msg.user}</span>
            <span className="text-white/90">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/5">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chat publicly as You..." 
            className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 p-1.5 text-white/60 hover:text-brand disabled:opacity-50 disabled:hover:text-white/60 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}