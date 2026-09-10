import React, { useState } from 'react';
import { MessageSquare, Shield, Send, Lock, UserCheck } from 'lucide-react';

export const MessagesView: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: 'SpeedDemon99', text: 'Hey Alex! Want to join my racing party for the championship?', time: '10:14 AM', isMe: false },
    { sender: 'You', text: 'Sure! Let me switch to my cyber racing avatar first.', time: '10:15 AM', isMe: true },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'You', text: input, time: 'Just now', isMe: true }]);
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Safe Chat & Messaging</h1>
            <p className="text-xs text-slate-400">Filtered & moderated safe communications</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
          <Shield className="w-4 h-4" />
          AI Content Guard Active
        </div>
      </div>

      {/* Messages Chat Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col h-[500px] justify-between">
        
        <div className="space-y-3 overflow-y-auto pr-2 flex-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs ${
                  m.isMe ? 'bg-cyan-500 text-slate-950 font-bold rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.sender} • {m.time}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            placeholder="Type safe message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button type="submit" className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
