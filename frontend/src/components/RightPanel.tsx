import { Users, UserCheck, Activity, Bell, MessageSquare, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface RightPanelProps {
  onlineCount: number;
  members: any[];
  typingUsers: string[];
  notifications: any[];
}

export default function RightPanel({ onlineCount, members, typingUsers, notifications }: RightPanelProps) {
  return (
    <div className="w-[300px] bg-slate-900 border-l border-white/5 h-full flex flex-col p-6 overflow-hidden flex-shrink-0 font-sans">
      
      {/* Active Team Members */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4 px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center">
              <Users className="h-3 w-3 mr-2 text-indigo-500" /> Team Online
            </h3>
            <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[9px] font-black">{onlineCount}</span>
        </div>
        
        <div className="space-y-4">
          {members.map((m: any) => (
             <div key={m.user.id} className="flex items-center space-x-3 group animate-in fade-in slide-in-from-right-1 transition-all">
                <div className="relative">
                   <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-[12px] font-black text-slate-400 border border-white/5 group-hover:border-indigo-500/50 transition-all">
                      {m.user.name[0].toUpperCase()}
                   </div>
                   <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                </div>
                <div className="overflow-hidden">
                   <p className="text-xs font-bold text-white flex items-center truncate">
                      {m.user.name}
                      {m.role === 'owner' && <UserCheck className="h-3 w-3 text-indigo-400 ml-1.5 opacity-50" />}
                   </p>
                   <p className="text-slate-500 text-[9px] font-medium tracking-wide uppercase opacity-30">Active Now</p>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="flex-1 overflow-hidden flex flex-col">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-2 flex items-center border-b border-white/5 pb-4 italic">
            <Bell className="h-3 w-3 mr-2 text-indigo-500" /> Notifications
         </h3>
         <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {notifications.length === 0 ? (
               <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-[10px] text-slate-700 uppercase font-black tracking-widest italic opacity-40 text-center">No recent alerts</p>
               </div>
            ) : (
               <div className="space-y-3">
                  {notifications.map((n, i) => (
                     <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center space-x-2 mb-1">
                           {n.type === 'message' ? <MessageSquare className="h-3 w-3 text-blue-400" /> : <CheckSquare className="h-3 w-3 text-emerald-400" />}
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{n.type}</span>
                        </div>
                        <p className="text-[11px] leading-snug text-slate-300 font-medium">"{n.message}"</p>
                        <p className="text-[8px] text-slate-600 mt-2 font-bold uppercase">{n.at ? format(new Date(n.at), 'h:mm a') : 'Just now'}</p>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* Real-time Typing */}
      <div className="mt-8">
         {typingUsers.length > 0 && (
            <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2 backdrop-blur-sm">
               <div className="flex space-x-1.5 mb-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
               <p className="text-[10px] text-indigo-300 font-bold leading-tight">
                  <span className="text-indigo-200">{typingUsers.join(', ')}</span> 
                  {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
               </p>
            </div>
         )}
      </div>

    </div>
  );
}
