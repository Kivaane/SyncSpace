import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageSquare, FileEdit, CheckSquare, LogOut, Plus, Layout, Settings } from 'lucide-react';
import { useAuthStore } from '../store';
import { useEffect, useState } from 'react';
import { api } from '../api';

interface SidebarProps {
  workspaceName?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  workspaces?: any[];
  onCreateWorkspace?: () => void;
}

export default function Sidebar({ workspaceName, activeTab, setActiveTab, workspaces: initialWorkspaces, onCreateWorkspace }: SidebarProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [workspaces, setWorkspaces] = useState<any[]>(initialWorkspaces || []);

  useEffect(() => {
     if (!initialWorkspaces || initialWorkspaces.length === 0) {
        api.get('/workspace/all').then(res => setWorkspaces(res.data)).catch(console.error);
     } else {
        setWorkspaces(initialWorkspaces);
     }
  }, [initialWorkspaces]);

  return (
    <div className="w-[260px] bg-slate-900 border-r border-white/5 flex flex-col h-full overflow-hidden shadow-2xl flex-shrink-0 z-50">
      <div className="p-6 h-full flex flex-col">
        
        {/* App Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-3 mb-10 cursor-pointer group"
        >
           <div className="h-11 w-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] transform transition-transform group-hover:scale-105">
              <Sparkles className="text-white h-6 w-6" />
           </div>
           <div>
              <h2 className="font-black text-white text-[19px] tracking-tight leading-none">SYNCSPACE</h2>
              <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1 opacity-80">Workspace Platform</p>
           </div>
        </div>

        {/* Tab Navigation (If in a Workspace context) */}
        {setActiveTab && (
          <div className="space-y-1 mb-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-3 flex items-center">
               Workspace Tools
            </h3>
            {[
              { id: 'chat', label: 'Team Chat', icon: MessageSquare },
              { id: 'editor', label: 'Cloud Editor', icon: FileEdit },
              { id: 'tasks', label: 'Task Board', icon: CheckSquare },
            ].map((t) => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === t.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Workspace Switcher */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 scroll-smooth">
           <div className="flex items-center justify-between mb-4 px-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                 Your Workspaces
              </h3>
              <Plus 
                className="h-4 w-4 text-slate-500 hover:text-white cursor-pointer transition-colors" 
                onClick={onCreateWorkspace || (() => navigate('/'))} 
              />
           </div>
           
           <div className="space-y-1">
              {workspaces.map(ws => (
                 <button 
                   key={ws.id} 
                   onClick={() => navigate(`/workspace/${ws.id}`)} 
                   className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs transition-all group ${
                     workspaceName === ws.name 
                     ? 'bg-white/5 text-indigo-400 border border-white/5' 
                     : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                   }`}
                 >
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                      workspaceName === ws.name ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-600 group-hover:bg-slate-700'
                    }`}>
                       {ws.name[0].toUpperCase()}
                    </div>
                    <span className="truncate font-bold tracking-tight">{ws.name}</span>
                 </button>
              ))}
           </div>
        </div>

        {/* User Profile */}
        <div className="mt-auto pt-6 border-t border-white/5">
           <div className="flex items-center space-x-3 px-3 py-4 rounded-xl hover:bg-white/5 transition-all group/user">
              <div className="h-9 w-9 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-bold text-white border border-white/5 uppercase shadow-xl group-hover:bg-indigo-600 transition-colors">
                 {user?.name?.[0] || '?'}
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user?.name}</p>
                 <p className="text-[9px] text-slate-500 truncate uppercase mt-0.5 tracking-widest font-black opacity-40">Verified Member</p>
              </div>
              <LogOut 
                className="h-4 w-4 text-slate-600 hover:text-red-400 cursor-pointer transition-colors opacity-0 group-hover/user:opacity-100" 
                onClick={logout} 
              />
           </div>
        </div>

      </div>
    </div>
  );
}
