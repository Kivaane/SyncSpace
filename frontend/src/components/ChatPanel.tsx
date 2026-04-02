import { format } from 'date-fns';
import { Send, Hash, Globe } from 'lucide-react';
import { FormEvent, RefObject } from 'react';

interface ChatPanelProps {
  messages: any[];
  newMessage: string;
  setNewMessage: (val: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  user: any;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onKeyPress: () => void;
}

export default function ChatPanel({ 
  messages, 
  newMessage, 
  setNewMessage, 
  handleSendMessage, 
  user, 
  messagesEndRef, 
  onKeyPress 
}: ChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Hash className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-white tracking-tight uppercase text-xs">Project Communications</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
            <Globe className="h-12 w-12 mb-4 text-slate-600" />
            <p className="text-xs uppercase font-black tracking-widest text-slate-500">Waiting for signals...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center space-x-2 mb-1.5 px-1">
                 <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">{msg.sender?.name}</span>
                 <span className="text-[9px] text-slate-700">{msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'now'}</span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed max-w-[80%] shadow-lg border ${
                msg.senderId === user?.id 
                ? 'bg-indigo-600 text-white border-white/10 rounded-tr-sm' 
                : 'bg-slate-900 text-slate-300 border-white/5 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-slate-950 border-t border-white/5 flex-shrink-0 z-10">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            placeholder="Broadcast a message..."
            value={newMessage}
            onKeyDown={() => onKeyPress()}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/50 text-slate-100 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="absolute right-2.5 p-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <Send className="h-5 w-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
