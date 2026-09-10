import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, MessageSquare, ChevronDown, ChevronUp, Bell, 
  Sparkles, Smile, Filter, Users, ShieldAlert
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: string;
  senderType: 'player' | 'other' | 'system';
  text: string;
  timestamp: string;
  color?: string;
}

interface InGameChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onFocusChange: (isFocused: boolean) => void;
  playerDisplayName: string;
  onlineCount?: number;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const QUICK_EMOTE_CHATS = [
  'GG! 🏆',
  'Let’s race! 🏎️',
  'Nice jump! ✨',
  'Watch out for traps! ⚠️',
  'Follow me! 🏃',
  'Hello world! 👋',
];

export const InGameChatWindow: React.FC<InGameChatWindowProps> = ({
  messages,
  onSendMessage,
  onFocusChange,
  playerDisplayName,
  onlineCount = 3,
  inputRef: externalInputRef,
}) => {
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [filter, setFilter] = useState<'all' | 'players' | 'system'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const localInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || localInputRef;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll on new message
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > prevMessagesLength.current) {
      setUnreadCount((prev) => prev + (messages.length - prevMessagesLength.current));
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isMinimized]);

  // Reset unread count when opening
  const handleToggleMinimize = () => {
    if (isMinimized) {
      setUnreadCount(0);
    }
    setIsMinimized(!isMinimized);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickChat = (text: string) => {
    onSendMessage(text);
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'players') return msg.senderType !== 'system';
    if (filter === 'system') return msg.senderType === 'system';
    return true;
  });

  return (
    <div 
      id="ingame-chat-window-wrapper"
      className="w-full sm:w-88 pointer-events-auto transition-all duration-200 select-text font-sans"
    >
      <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
        
        {/* Chat Header */}
        <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-wide">World Chat</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mr-1">
              <Users className="w-3 h-3 text-cyan-400" />
              {onlineCount} in Server
            </span>

            {/* Minimize / Expand Button */}
            <button
              id="btn-toggle-chat-minimize"
              onClick={handleToggleMinimize}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer relative"
              title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isMinimized && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Chat Body */}
        {!isMinimized && (
          <div className="p-3 space-y-2.5">
            
            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-1 text-[10px] border-b border-slate-900 pb-1.5">
              <div className="flex items-center gap-1">
                {(['all', 'players', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilter(mode)}
                    className={`px-2 py-0.5 rounded-md font-bold uppercase transition-colors cursor-pointer ${
                      filter === mode
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-slate-500 font-mono">Press [T] or [/] to chat</span>
            </div>

            {/* Message History Viewport */}
            <div 
              id="ingame-chat-messages-container"
              className="h-32 sm:h-36 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 text-xs"
            >
              {filteredMessages.length === 0 ? (
                <div className="text-center text-slate-500 text-[11px] py-6">
                  No messages in this filter
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  if (msg.senderType === 'system') {
                    return (
                      <div 
                        key={msg.id} 
                        className="p-1.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-[11px] text-emerald-300/90 flex items-start gap-1.5"
                      >
                        <span className="font-bold text-emerald-400 uppercase text-[9px] px-1 py-0.2 rounded bg-emerald-500/20">
                          System
                        </span>
                        <span className="flex-1 leading-snug">{msg.text}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>
                    );
                  }

                  const isLocalPlayer = msg.sender === playerDisplayName;
                  const senderColor = msg.color || (isLocalPlayer ? 'text-cyan-400' : 'text-amber-400');

                  return (
                    <div 
                      key={msg.id} 
                      className={`p-1.5 rounded-xl border transition-colors ${
                        isLocalPlayer 
                          ? 'bg-cyan-950/20 border-cyan-500/30' 
                          : 'bg-slate-900/40 border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className={`font-black ${senderColor} flex items-center gap-1`}>
                          {isLocalPlayer ? 'You (' + msg.sender + ')' : msg.sender}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="text-slate-200 text-xs break-words leading-relaxed pl-0.5">
                        {msg.text}
                      </p>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emote / Reaction Shortcuts */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_EMOTE_CHATS.map((emote) => (
                <button
                  key={emote}
                  onClick={() => handleQuickChat(emote)}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {emote}
                </button>
              ))}
            </div>

            {/* In-Game Chat Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pt-0.5">
              <input
                id="ingame-chat-input"
                ref={inputRef}
                type="text"
                placeholder="Type message in world... (Press Enter)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => onFocusChange(true)}
                onBlur={() => onFocusChange(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    inputRef.current?.blur();
                  }
                }}
                maxLength={120}
                className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <button
                id="ingame-chat-send-btn"
                type="submit"
                disabled={!inputText.trim()}
                className={`p-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center ${
                  inputText.trim()
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title="Send Message (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
