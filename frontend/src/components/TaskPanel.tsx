import { useState, useEffect, useRef } from 'react';
import { 
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, CheckSquare, Clock, CheckCircle2, GripVertical, User, ChevronRight, ChevronLeft, ArrowRight, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../api';

interface Task {
  id: number;
  title: string;
  status: string;
  order: number;
  assignee?: { id: number; name: string };
  assigneeId?: number;
}

function SortableTaskCard({ 
  task, 
  onMove, 
  onAssign, 
  onDelete, 
  workspaceMembers 
}: { 
  task: Task; 
  onMove: (status: string) => void;
  onAssign: (userId: number) => void;
  onDelete: () => void;
  workspaceMembers: any[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowAssignDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card-premium p-4 mb-4 group/card select-none relative !overflow-visible w-full hover:border-indigo-500/20 active:scale-[0.98] transition-all"
    >
      {/* Task Header/Title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-[13px] font-bold text-white leading-relaxed pr-6">{task.title}</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider opacity-60">
            {task.status === 'done' ? 'Completed' : 'Move task →'}
          </p>
        </div>
        <div className="flex items-center space-x-1">
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="opacity-0 group-hover/card:opacity-100 p-1.5 text-slate-700 hover:text-red-500 transition-all bg-slate-800/20 rounded-lg hover:bg-red-500/10"
           >
              <Trash2 className="h-3.5 w-3.5" />
           </button>
           <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 text-slate-700 hover:text-indigo-400 transition-all bg-slate-800/20 rounded-lg">
              <GripVertical className="h-4 w-4" />
           </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between mt-6 gap-2 bg-slate-800/40 p-1.5 rounded-xl border border-white/5">
         <div className="w-8 h-8">
            {task.status !== 'todo' && (
               <button 
                  onClick={() => onMove(task.status === 'done' ? 'inprogress' : 'todo')} 
                  className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-all shadow-sm border border-white/5"
               >
                  <ChevronLeft className="h-4 w-4" />
               </button>
            )}
         </div>

         <div className="relative flex-1 flex justify-center" ref={dropdownRef}>
            <button 
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="flex items-center space-x-2 px-2 py-1.5 rounded-lg border border-transparent hover:bg-white/5 transition-all w-full justify-center"
            >
               <div className="h-5 w-5 bg-indigo-500/10 rounded-md flex items-center justify-center text-[9px] font-black text-indigo-400 border border-indigo-500/20">
                  {task.assignee?.name?.[0] || <User className="h-3 w-3 opacity-30" />}
               </div>
               <span className="text-[10px] font-bold text-slate-400 truncate max-w-[80px]">
                  {task.assignee?.name || 'Unassigned'}
               </span>
            </button>
            
            {showAssignDropdown && (
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[200] animate-slide-up backdrop-blur-3xl">
                  {workspaceMembers.length === 0 ? <p className="text-[10px] p-3 italic text-slate-700">No members listed</p> : (
                    workspaceMembers.map(m => (
                       <button 
                         key={m.user.id} 
                         onClick={() => { onAssign(m.user.id); setShowAssignDropdown(false); }}
                         className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center space-x-3"
                       >
                          <div className="h-6 w-6 bg-indigo-500 rounded-lg flex items-center justify-center text-[9px] text-white uppercase font-black">{m.user.name[0]}</div>
                          <span className="truncate">{m.user.name}</span>
                       </button>
                    ))
                  )}
               </div>
            )}
         </div>

         <div className="w-8 h-8">
            {task.status !== 'done' && (
               <button 
                  onClick={() => onMove(task.status === 'todo' ? 'inprogress' : 'done')} 
                  className="w-full h-full flex items-center justify-center bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-500/20"
               >
                  <ChevronRight className="h-4 w-4" />
               </button>
            )}
         </div>
      </div>
    </div>
  );
}

export default function TaskPanel({ workspaceId }: { workspaceId: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTasks = async () => {
    try {
      const [tskRes, memRes] = await Promise.all([
        api.get(`/tasks/${workspaceId}/all`),
        api.get(`/workspace/${workspaceId}`)
      ]);
      setTasks(tskRes.data);
      setMembers(memRes.data.members || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTasks(); }, [workspaceId]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveTask(tasks.find(t => t.id === active.id) || null);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) { setActiveTask(null); return; }

    const activeTask = tasks.find(t => t.id === active.id);
    const overId = over.id;

    let newStatus = activeTask?.status;
    if (['todo', 'inprogress', 'done'].includes(overId as string)) {
       newStatus = overId as string;
    } else {
       const overTask = tasks.find(t => t.id === overId);
       if (overTask) newStatus = overTask.status;
    }

    if (activeTask && (active.id !== overId || newStatus !== activeTask.status)) {
       const newTasks = arrayMove(
         tasks.map(t => t.id === active.id ? { ...t, status: newStatus as string } : t),
         tasks.findIndex(t => t.id === active.id),
         tasks.findIndex(t => t.id === overId)
       );
       setTasks(newTasks);
       await api.patch(`/tasks/${workspaceId}/update/${active.id}`, { status: newStatus });
    }
    setActiveTask(null);
  };

  const handleStatusUpdate = async (taskId: number, status: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    await api.patch(`/tasks/${workspaceId}/update/${taskId}`, { status });
  };

  const handleAssign = async (taskId: number, assigneeId: number) => {
    const mem = members.find(m => m.user.id === assigneeId);
    if (!mem) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignee: mem.user, assigneeId } : t));
    await api.patch(`/tasks/${workspaceId}/update/${taskId}`, { assigneeId });
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Terminate this task node?')) return;
    try {
       setTasks(prev => prev.filter(t => t.id !== taskId));
       await api.delete(`/tasks/${workspaceId}/delete/${taskId}`);
    } catch (err) { console.error(err); }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
       const res = await api.post(`/tasks/${workspaceId}/create`, { title: newTaskTitle });
       setTasks([res.data, ...tasks]);
       setNewTaskTitle('');
       setShowAddModal(false);
    } catch (err) { console.error(err); }
  };

  const columns = [
    { id: 'todo', title: 'To Do', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/5' },
    { id: 'inprogress', title: 'In Progress', icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-400/5' },
    { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/20 overflow-hidden relative">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 p-10 overflow-hidden h-full">
           {columns.map((col) => (
              <div key={col.id} className="min-w-0 flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative">
                 <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center space-x-3">
                       <div className={`${col.bg} ${col.color} p-2 rounded-xl border border-white/5 shadow-inner`}>
                          <col.icon className="h-4 w-4" />
                       </div>
                       <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{col.title}</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/5">
                       {tasks.filter(t => t.status === col.id).length}
                    </span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar scroll-smooth pb-12" style={{ height: 'calc(100vh - 220px)' }}>
                   <SortableContext id={col.id} items={tasks.filter(t => t.status === col.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {tasks.filter(t => t.status === col.id).map(task => (
                        <SortableTaskCard key={task.id} task={task} workspaceMembers={members} onMove={(s) => handleStatusUpdate(task.id, s)} onAssign={(uid) => handleAssign(task.id, uid)} onDelete={() => handleDeleteTask(task.id)} />
                      ))}
                      {tasks.filter(t => t.status === col.id).length === 0 && (
                         <div className="h-full min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[var(--radius-xl)] opacity-40 hover:opacity-60 transition-all p-10 text-center animate-pulse">
                            <Sparkles className="h-6 w-6 mb-4 text-slate-600" />
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                               ✨ No tasks yet — create one to get started
                            </p>
                         </div>
                      )}
                   </SortableContext>
                 </div>
              </div>
           ))}
        </div>

        <DragOverlay>
           {activeTask ? (
             <div className="w-[300px] bg-slate-900 border border-indigo-500/50 rounded-[var(--radius-lg)] p-6 shadow-2xl opacity-95 scale-105 rotate-2">
                <h4 className="text-sm font-bold text-white mb-2">{activeTask.title}</h4>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 uppercase font-black">
                   <div className="h-4 w-4 bg-indigo-600 rounded-md"></div>
                   <span>Moving Payload...</span>
                </div>
             </div>
           ) : null}
        </DragOverlay>
      </DndContext>

      {/* Action Button Integrated */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 right-10 h-14 w-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 active:scale-90 hover:scale-110 transition-all z-[200] group"
      >
         <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Modal - Unified Style */}
      {showAddModal && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-8 backdrop-blur-3xl">
            <div className="absolute inset-0 bg-slate-950/90" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-12 w-full max-w-md shadow-2xl animate-slide-up">
               <h3 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase whitespace-nowrap">Authorization Node</h3>
               <p className="text-slate-500 text-sm mb-12 font-medium italic opacity-60">Establish new task identity in the workspace flow.</p>
               <input autoFocus type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task Identity..." className="input-premium w-full text-lg shadow-inner bg-slate-950/50" />
               <div className="flex space-x-4 mt-12">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-600 font-black hover:text-white uppercase text-[10px] tracking-widest">Abort</button>
                  <button onClick={handleCreateTask} className="btn-primary flex-[2] uppercase text-[10px] tracking-widest">Initialize Task</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
