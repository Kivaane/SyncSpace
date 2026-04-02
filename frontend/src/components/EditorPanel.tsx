import { useState } from 'react';
import { FileEdit, Eye, Layout, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EditorPanelProps {
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: () => void;
  editorRef: any;
}

export default function EditorPanel({ content, onChange, onKeyDown, editorRef }: EditorPanelProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      
      {/* Dynamic Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
             <FileEdit className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
             <h3 className="font-bold text-white tracking-tight text-xs uppercase opacity-80">Document Intelligence / SyncEditor.md</h3>
             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Real-time Collaboration Active</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-900/50 border border-white/5 p-1 rounded-xl">
           <button 
             onClick={() => setMode('edit')}
             className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all ${mode === 'edit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
              <FileText className="h-3 w-3" />
              <span>Draft</span>
           </button>
           <button 
             onClick={() => setMode('preview')}
             className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all ${mode === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
              <Eye className="h-3 w-3" />
              <span>Preview</span>
           </button>
        </div>
      </div>
      
      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-950 selection:bg-indigo-500/40">
        <div className="max-w-3xl mx-auto h-full space-y-4">
           {mode === 'edit' ? (
              <div className="h-full flex flex-col">
                 <div className="h-0.5 w-12 bg-indigo-500/30 rounded-full mb-8" />
                 <textarea
                   ref={editorRef}
                   value={content}
                   onChange={onChange}
                   onKeyDown={() => onKeyDown()}
                   placeholder="Draft your workspace intelligence here using Markdown..."
                   className="w-full flex-1 bg-transparent text-slate-100 text-lg leading-loose focus:outline-none resize-none placeholder:text-slate-800 placeholder:italic font-serif tracking-tight font-medium custom-scrollbar"
                 />
              </div>
           ) : (
              <div className="prose prose-invert prose-indigo max-w-none animate-in fade-in slide-in-from-bottom-4 duration-300 px-4">
                <div className="h-0.5 w-12 bg-emerald-500/30 rounded-full mb-8" />
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                   {content || '*No content to preview. Start drafting above.*'}
                </ReactMarkdown>
              </div>
           )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="px-8 py-3 border-t border-white/5 bg-slate-900/10 flex justify-between items-center text-[10px] text-slate-600 uppercase font-black tracking-widest">
         <div className="flex items-center space-x-4">
            <span className="flex items-center"><Layout className="h-3 w-3 mr-1.5 opacity-50" /> UTF-8 ENCODING</span>
            <span className="flex items-center"><Sparkles className="h-3 w-3 mr-1.5 text-indigo-500 opacity-50" /> AUTO-SAVE ACTIVE</span>
         </div>
         <div className="flex items-center space-x-1.5 grayscale opacity-50">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sync Synchronized</span>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .prose h1 { font-size: 1.875rem; font-weight: 900; margin-bottom: 1.5rem; margin-top: 2rem; color: white; }
        .prose h2 { font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem; margin-top: 1.5rem; color: #f1f5f9; }
        .prose p { color: #cbd5e1; line-height: 2; margin-bottom: 1rem; }
        .prose ul { list-style-type: disc; list-style-position: inside; margin-bottom: 1rem; color: #94a3b8; }
        .prose strong { color: #818cf8; font-weight: 700; }
        .prose code { background: #0f172a; padding: 0.125rem 0.375rem; border-radius: 0.375rem; color: #f472b6; font-family: monospace; }
      `}} />
    </div>
  );
}
