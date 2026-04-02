import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuthStore } from '../store';
import Sidebar from '../components/Sidebar';
import { 
  Plus, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Activity, 
  LayoutGrid, 
  ChevronRight,
  ShieldCheck,
  FileText,
  UserPlus
} from 'lucide-react';

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [stats, setStats] = useState({ messages: 0, tasksCompleted: 0, activeUsers: 0 });
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wsRes, statsRes] = await Promise.all([
        api.get('/workspace/all'),
        api.get('/stats').catch(() => ({ data: { messages: 0, tasksCompleted: 0, activeUsers: 0 } })),
      ]);
      setWorkspaces(wsRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
         localStorage.clear();
         window.location.href = "/login";
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    try {
      await api.post('/workspace/create', { name: workspaceName });
      setShowCreateModal(false);
      setWorkspaceName('');
      window.location.reload(); 
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to create workspace.'); }
  };

  const handleInvite = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!inviteEmail.trim() || workspaces.length === 0) return;
     try {
        await api.post(`/workspace/${workspaces[0].id}/invite`, { email: inviteEmail });
        setInviteEmail('');
        setShowInviteModal(false);
        alert("Invitation sent successfully.");
     } catch (err: any) { alert(err.response?.data?.message || 'Failed to send invite.'); }
  };

  const statItems = [
    { label: 'TOTAL MESSAGES', val: stats.messages, icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { label: 'TASKS FINISHED', val: stats.tasksCompleted, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'TEAM MEMBERS', val: stats.activeUsers, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'SYSTEM UPTIME', val: '99.9%', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ];

  const quickActions = [
    { label: 'NEW WORKSPACE', icon: Plus, iconColor: 'text-indigo-400', action: () => setShowCreateModal(true) },
    { label: 'EDITOR', icon: FileText, iconColor: 'text-violet-400', action: () => navigate(workspaces.length ? `/workspace/${workspaces[0].id}` : '#') },
    { label: 'INVITE USER', icon: UserPlus, iconColor: 'text-blue-400', action: () => setShowInviteModal(true) },
    { label: 'NEW TASK', icon: CheckCircle2, iconColor: 'text-amber-400', action: () => navigate(workspaces.length ? `/workspace/${workspaces[0].id}` : '#') },
  ];

  if (loading) return (
    <div className="h-screen bg-[#0d1017] flex items-center justify-center">
       <div className="h-8 w-8 bg-indigo-600 rounded-xl animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.5)]"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0d1017] overflow-hidden font-sans">
      <Sidebar workspaces={workspaces} onCreateWorkspace={() => setShowCreateModal(true)} />

      <main className="flex-1 flex overflow-hidden">
        {/* CENTER PANEL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-10 px-10 animate-fade-in">

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-[36px] font-black text-white tracking-tight leading-none mb-1 uppercase">DASHBOARD</h1>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-3 w-3 text-indigo-500 opacity-50" />
              <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">LOGGED IN AS: <span className="text-indigo-400">{user?.name}</span></p>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {statItems.map((s, i) => (
              <div key={i} className="bg-[#131722] border border-white/[0.05] rounded-2xl p-5 flex flex-col group hover:border-white/10 transition-all cursor-default">
                <div className="flex items-start justify-between mb-6">
                  <div className={`h-8 w-8 ${s.bg} border ${s.border} rounded-lg flex items-center justify-center`}>
                    <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[32px] font-black text-white leading-none tracking-tight mb-1">{s.val}</p>
                <p className="text-[9px] font-bold text-slate-600 tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Workspaces Section */}
          <section>
            <div className="flex items-center space-x-2 mb-5">
               <LayoutGrid className="h-3.5 w-3.5 text-indigo-500" />
               <h3 className="text-[11px] font-black text-white uppercase tracking-widest">YOUR WORKSPACES</h3>
            </div>

            {workspaces.length === 0 ? (
               <div 
                 onClick={() => setShowCreateModal(true)}
                 className="w-full h-[300px] bg-[#131722]/60 border border-dashed border-white/[0.06] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/20 transition-all group"
               >
                  <div className="h-10 w-10 bg-[#1a2030] border border-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:border-indigo-500/20 transition-all">
                     <Plus className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-[15px] font-black text-white mb-1 tracking-tight">No Workspaces Found</h3>
                  <p className="text-[10px] text-slate-600 font-medium max-w-[220px] text-center leading-relaxed">Create your first workspace to start collaborating with your team.</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 gap-4">
                  {workspaces.map(ws => (
                    <div 
                      key={ws.id} 
                      onClick={() => navigate(`/workspace/${ws.id}`)}
                      className="bg-[#131722] border border-white/[0.05] rounded-2xl p-6 cursor-pointer group hover:border-indigo-500/20 transition-all flex items-center space-x-4"
                    >
                      <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg flex-shrink-0">
                        {ws.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors truncate uppercase">{ws.name}</h4>
                        <p className="text-[9px] text-slate-700 font-bold tracking-widest mt-0.5 uppercase">Active</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                    </div>
                  ))}
               </div>
            )}
          </section>
        </div>

        {/* RIGHT PANEL - ACTIONS & ACTIVITY */}
        <div className="w-[340px] bg-[#0d1017] border-l border-white/[0.04] py-10 px-8 flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar">
           
           {/* Quick Actions */}
           <div className="mb-8">
              <h3 className="text-[9px] font-black text-slate-700 tracking-[0.3em] mb-5 uppercase">QUICK ACTIONS</h3>
              <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((act, i) => (
                     <button 
                       key={i} 
                       onClick={act.action}
                       className="bg-[#131722] border border-white/[0.05] rounded-2xl flex flex-col items-center justify-center py-6 px-4 group hover:bg-[#161e2d] hover:border-white/10 transition-all"
                     >
                        <div className="h-10 w-10 bg-[#0d1017] border border-white/5 rounded-xl flex items-center justify-center mb-3 group-hover:border-white/10 transition-all">
                           <act.icon className={`h-4 w-4 ${act.iconColor} opacity-60 group-hover:opacity-100 transition-all`} />
                        </div>
                        <span className="text-[8px] font-black tracking-widest text-center text-slate-700 group-hover:text-slate-400 uppercase">{act.label}</span>
                     </button>
                  ))}
              </div>
           </div>

           {/* Recent Activity */}
           <div>
              <h3 className="text-[9px] font-black text-slate-700 tracking-[0.3em] mb-5 uppercase">RECENT ACTIVITY</h3>
              <div className="h-[200px] flex flex-col items-center justify-center text-center border border-dashed border-white/[0.05] rounded-2xl opacity-30">
                 <Activity className="h-6 w-6 text-slate-700 mb-3" />
                 <p className="text-[9px] font-bold text-slate-700 tracking-widest uppercase">No activity yet</p>
              </div>
           </div>
        </div>
      </main>

      {/* MODALS */}
      {(showCreateModal || showInviteModal) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-2xl bg-black/60">
           <div className="bg-[#131722] border border-white/[0.06] rounded-2xl p-10 w-full max-w-md shadow-2xl animate-slide-up">
              <h3 className="text-2xl font-black text-white tracking-tight mb-1 uppercase">
                {showCreateModal ? 'New Workspace' : 'Invite Member'}
              </h3>
              <p className="text-[10px] text-slate-600 font-bold tracking-widest mb-8 uppercase">
                {showCreateModal ? 'Create a new collaborative space' : 'Add a team member to your workspace'}
              </p>

              <div className="mb-6">
                 <label className="text-[9px] font-black text-slate-700 tracking-widest mb-2 block uppercase">
                   {showCreateModal ? 'Workspace Name' : 'Email Address'}
                 </label>
                 <input 
                   autoFocus
                   type={showCreateModal ? "text" : "email"}
                   placeholder={showCreateModal ? "Enter workspace name..." : "Enter email address..."}
                   value={showCreateModal ? workspaceName : inviteEmail}
                   onChange={e => showCreateModal ? setWorkspaceName(e.target.value) : setInviteEmail(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && (showCreateModal ? handleCreateWorkspace(e as any) : handleInvite(e as any))}
                   className="w-full bg-[#0d1017] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 placeholder:text-slate-700 transition-all"
                 />
              </div>

              <div className="flex space-x-3">
                 <button 
                   onClick={() => { setShowCreateModal(false); setShowInviteModal(false); }}
                   className="flex-1 py-3 text-slate-600 font-black hover:text-white uppercase text-[9px] tracking-widest transition-all"
                 >Cancel</button>
                 <button 
                   onClick={showCreateModal ? handleCreateWorkspace : handleInvite}
                   className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl py-3 text-[10px] tracking-widest uppercase transition-all shadow-lg shadow-indigo-600/20"
                 >
                   {showCreateModal ? 'Create Workspace' : 'Send Invite'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
