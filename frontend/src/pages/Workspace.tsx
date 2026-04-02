import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuthStore } from '../store';
import { io, Socket } from 'socket.io-client';
import { 
  Loader2, 
  Search, 
  Bell, 
  Plus, 
  ChevronDown, 
  MessageSquare, 
  CheckSquare, 
  FileEdit, 
  Users, 
  Layout, 
  Trash2,
  Rocket,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

import Sidebar from '../components/Sidebar';
import ChatPanel from '../components/ChatPanel';
import EditorPanel from '../components/EditorPanel';
import TaskPanel from '../components/TaskPanel';
import RightPanel from '../components/RightPanel';

let socket: Socket;

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [docContent, setDocContent] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  


  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskAddModal, setShowTaskAddModal] = useState(false);
  const [newVal, setNewVal] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const plusRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(event.target as Node)) setShowPlusMenu(false);
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) setShowNotificationMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wsRes, msgRes, allWsRes, actRes] = await Promise.all([
          api.get(`/workspace/${id}`),
          api.get(`/workspace/${id}/messages`),
          api.get('/workspace/all'),
          api.get(`/activities?workspaceId=${id}`)
        ]);
        setWorkspace(wsRes.data);
        setMessages(msgRes.data);
        setWorkspaces(allWsRes.data);
        setNotifications(actRes.data.map((a: any) => ({
           id: a.id,
           type: a.type === 'message' ? 'message' : a.type === 'task_create' ? 'task' : 'system',
           message: a.content,
           at: new Date(a.createdAt)
        })));
      } catch (err) { console.error(err); navigate('/'); }
    };
    fetchData();

    socket = io('http://localhost:3000');
    socket.emit('joinWorkspace', { workspaceId: Number(id), userId: user?.id, name: user?.name });
    socket.emit('joinEditor', { workspaceId: Number(id) });

    socket.on('receive_message', (message: any) => {
      setMessages((prev) => [...prev, message]);
      setNotifications(prev => [{ type: 'message', message: `New message from ${message.sender?.name}`, at: new Date() }, ...prev.slice(0, 15)]);
    });

    socket.on('editor_receive', (data: { content: string }) => { setDocContent(data.content); });
    socket.on('presenceUpdate', (data: { onlineCount: number }) => { setOnlineCount(data.onlineCount); });

    socket.on('user_joined', (data: { name: string }) => {
       setNotifications(prev => [{ type: 'user', message: `${data.name} joined the workspace`, at: new Date() }, ...prev.slice(0, 15)]);
    });

    socket.on('task_created', (task: any) => {
       setNotifications(prev => [{ type: 'task', message: `Task created: ${task.title}`, at: new Date() }, ...prev.slice(0, 15)]);
    });

    socket.on('task_updated', (task: any) => {
       setNotifications(prev => [{ type: 'task', message: `Task updated: ${task.title}`, at: new Date() }, ...prev.slice(0, 15)]);
    });

    socket.on('userTyping', (data: { userId: number; name: string, isTyping: boolean }) => {
      if (data.userId === user?.id) return;
      setTypingUsers(prev => data.isTyping ? (!prev.includes(data.name) ? [...prev, data.name] : prev) : prev.filter(n => n !== data.name));
    });

    return () => { if (socket) socket.disconnect(); };
  }, [id, navigate, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    socket.emit('send_message', { workspaceId: Number(id), senderId: user.id, content: newMessage });
    setNewMessage('');
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setDocContent(content);
    socket.emit('editor_update', { workspaceId: Number(id), content });
  };

  const handleKeyPress = () => {
     if (!user) return;
     socket.emit('typingStart', { workspaceId: Number(id), userId: user.id, name: user.name });
     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
     typingTimeoutRef.current = setTimeout(() => { socket.emit('typingStop', { workspaceId: Number(id), userId: user.id }); }, 2000);
  };

  useEffect(() => {
     if (!searchQuery.trim()) { setSearchResults(null); return; }
     const delayDebounce = setTimeout(async () => {
        setIsSearching(true);
        try { const res = await api.get(`/workspace/search?q=${searchQuery}`); setSearchResults(res.data); } 
        catch (err) { console.error(err); } finally { setIsSearching(false); }
     }, 500);
     return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleQuickCreate = async (type: 'workspace' | 'task') => {
     if (!newVal) return;
     try {
        if (type === 'workspace') {
           const res = await api.post('/workspace/create', { name: newVal });
           navigate(`/workspace/${res.data.id}`);
        } else {
           await api.post(`/tasks/${id}/create`, { title: newVal });
           setActiveTab('tasks');
        }
        setNewVal('');
        setShowTaskAddModal(false);
        setShowCreateModal(false);
     } catch (err) { console.error(err); }
  };

  if (!workspace) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 font-sans">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-700 italic opacity-50">Loading Workspace...</p>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-950 text-slate-200">
      <Sidebar 
        workspaceName={workspace.name} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        workspaces={workspaces}
        onCreateWorkspace={() => setShowCreateModal(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
         {/* Top Bar Header Alignment Fix */}
         <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/20 backdrop-blur-3xl z-40 relative gap-8">
            
            {/* Context Title Hierarchy */}
            <div className="flex-shrink-0 min-w-[200px]">
               <h1 className="text-2xl font-bold tracking-tight text-white m-0">
                 {activeTab === 'chat' ? 'Team Chat' : activeTab === 'editor' ? 'Cloud Editor' : 'Task Board'}
               </h1>
               <p className="text-[11px] font-medium text-slate-500 opacity-60 m-0 uppercase tracking-widest mt-0.5">
                 {workspace.name} Control
               </p>
            </div>

            {/* Centered Search Bar */}
            <div className="flex-1 max-w-[600px] relative">
               <div className="relative group w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-all" />
                  <input 
                    type="text" 
                    placeholder="Global Intelligence Search..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-900/40 border border-white/5 rounded-2xl pl-14 pr-4 py-3 text-xs text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all w-full shadow-inner font-bold placeholder:text-slate-700"
                  />
                  {searchQuery && (
                     <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-full bg-slate-900 border border-white/10 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] z-50 p-6 animate-slide-up backdrop-blur-3xl max-h-[400px] overflow-y-auto custom-scrollbar">
                        {isSearching ? <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" /></div> : (
                           <div className="space-y-8">
                              <div>
                                 <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4 border-b border-white/5 pb-3">Messages</h4>
                                 {searchResults?.messages?.length ? searchResults.messages.map((m: any) => (
                                    <div key={m.id} className="p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer mb-1">
                                       <p className="text-xs text-slate-300 font-medium">"{m.content}"</p>
                                       <span className="text-[9px] text-indigo-500/50 uppercase font-bold mt-1">• {m.sender?.name}</span>
                                    </div>
                                 )) : <p className="text-[10px] text-slate-800 p-2 italic uppercase font-black tracking-widest">No results</p>}
                              </div>
                              <div>
                                 <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4 border-b border-white/5 pb-3">Tasks</h4>
                                 {searchResults?.tasks?.length ? searchResults.tasks.map((t: any) => (
                                    <div key={t.id} onClick={() => { setActiveTab('tasks'); setSearchQuery(''); }} className="p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-between mb-1">
                                       <p className="text-xs text-slate-300 font-bold">{t.title}</p>
                                       <span className={`text-[8px] px-2 py-0.5 rounded-lg uppercase font-black border ${t.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{t.status}</span>
                                    </div>
                                 )) : <p className="text-[10px] text-slate-800 p-2 italic uppercase font-black tracking-widest">No results</p>}
                              </div>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>

            {/* Consistent Icon Buttons Row */}
            <div className="flex items-center space-x-4 flex-shrink-0">
               {/* Add Menu */}
               <div className="relative" ref={plusRef}>
                  <button 
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    className="icon-button group"
                  >
                     <Plus className={`h-5 w-5 transition-transform ${showPlusMenu ? 'rotate-45' : ''}`} />
                  </button>
                  {showPlusMenu && (
                     <div className="absolute top-14 right-0 w-60 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 animate-slide-up z-[100] backdrop-blur-2xl">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] my-3 px-3">Workspace Actions</p>
                        {[
                           { label: 'New Workspace', icon: Layout, onClick: () => { setShowCreateModal(true); setShowPlusMenu(false); } },
                           { label: 'Assign Task', icon: CheckSquare, onClick: () => { setShowTaskAddModal(true); setShowPlusMenu(false); } },
                        ].map((o, i) => (
                           <button key={i} onClick={o.onClick} className="w-full flex items-center space-x-3 p-3 hover:bg-white/5 rounded-xl transition-all text-xs font-bold text-slate-400 hover:text-white">
                              <o.icon className="h-4 w-4 text-indigo-500/60" />
                              <span>{o.label}</span>
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               {/* Notifications */}
               <div className="relative" ref={bellRef}>
                  <button 
                    onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                    className="icon-button relative"
                  >
                     <Bell className="h-4 w-4" />
                     {notifications.length > 0 && <div className="absolute top-2.5 right-2.5 h-2 w-2 bg-indigo-500 rounded-full border-2 border-slate-900 animate-pulse"></div>}
                  </button>
                  {showNotificationMenu && (
                     <div className="absolute top-14 right-0 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] p-6 animate-slide-up z-[100] backdrop-blur-3xl overflow-hidden">
                        <div className="flex items-center justify-between mb-6 px-2">
                           <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Activity Notifications</h3>
                           <button onClick={() => setNotifications([])} className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                           {notifications.length === 0 ? (
                              <p className="text-center text-[10px] text-slate-700 font-black uppercase tracking-widest py-10 italic">No updates</p>
                           ) : (
                              notifications.map((n, i) => (
                                 <div key={i} className="p-4 bg-slate-800/50 border border-white/5 rounded-2xl animate-slide-up hover:border-white/10 transition-all">
                                    <div className="flex items-center space-x-3 mb-2">
                                       {n.type === 'message' ? <MessageSquare className="h-3 w-3 text-blue-400" /> : n.type === 'task' ? <CheckSquare className="h-3 w-3 text-emerald-400" /> : <Rocket className="h-3 w-3 text-indigo-400" />}
                                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{n.type}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-snug font-medium">"{n.message}"</p>
                                    <p className="text-[8px] text-slate-700 font-black mt-2 uppercase tracking-widest border-t border-white/5 pt-2">{format(new Date(n.at), 'h:mm a')}</p>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  )}
               </div>

               {/* Theme Toggle Removed for Uniformity */}
            </div>
         </div>

         <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeTab === 'chat' && <ChatPanel messages={messages} newMessage={newMessage} setNewMessage={setNewMessage} handleSendMessage={handleSendMessage} user={user} messagesEndRef={messagesEndRef} onKeyPress={handleKeyPress} />}
            {activeTab === 'editor' && <EditorPanel content={docContent} onChange={handleEditorChange} onKeyDown={handleKeyPress} editorRef={editorRef} />}
            {activeTab === 'tasks' && <TaskPanel workspaceId={Number(id)} />}
         </div>
      </div>

      <RightPanel onlineCount={onlineCount} members={workspace.members || []} typingUsers={typingUsers} notifications={notifications} />

      {/* Responsive Workspace Detail Panels */}
      {(showTaskAddModal || showCreateModal) && (
         <div className="fixed inset-0 z-[400] flex items-center justify-center p-8 backdrop-blur-3xl">
            <div className="absolute inset-0 bg-slate-950/80" onClick={() => { setShowTaskAddModal(false); setShowCreateModal(false); }} />
            <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
               <h3 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase whitespace-nowrap">{showCreateModal ? 'New Workspace' : 'Add Task'}</h3>
               <p className="text-slate-500 text-sm mb-12 font-medium italic opacity-60 leading-relaxed">Specify the parameters for the new workspace operation.</p>
               <input autoFocus type="text" placeholder={showCreateModal ? "Label ID..." : "Task Identifier..."} value={newVal} onChange={e => setNewVal(e.target.value)} className="input-premium w-full text-lg shadow-inner bg-slate-950/50" />
               <div className="flex space-x-5 mt-10">
                  <button onClick={() => { setShowTaskAddModal(false); setShowCreateModal(false); }} className="flex-1 py-4 text-slate-600 font-black hover:text-white uppercase text-[11px] tracking-widest">Abort</button>
                  <button onClick={() => handleQuickCreate(showCreateModal ? 'workspace' : 'task')} className="btn-primary flex-[2] uppercase text-[11px] tracking-widest font-black">Authorize</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
