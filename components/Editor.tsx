import React, { useState, useEffect, useRef } from 'react';
import { LoreEntry, EntryType } from '../types';
import { Sparkles, Save, Tag, Trash2, Copy, Check, SidebarClose, SidebarOpen, Hash, Upload, Image as ImageIcon, X } from 'lucide-react';

interface EditorProps {
  entry: LoreEntry;
  categories: string[];
  onUpdate: (updated: LoreEntry) => void;
  onDelete: (id: string) => void;
  onGenerate: (prompt: string, context: string) => void;
  isGenerating: boolean;
}

export const Editor: React.FC<EditorProps> = ({ 
  entry, 
  categories, 
  onUpdate, 
  onDelete, 
  onGenerate,
  isGenerating
}) => {
  const [localTitle, setLocalTitle] = useState(entry.title);
  const [localContent, setLocalContent] = useState(entry.content);
  const [localKeys, setLocalKeys] = useState(entry.keys.join(', '));
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [showInspector, setShowInspector] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when entry changes prop
  useEffect(() => {
    setLocalTitle(entry.title);
    setLocalContent(entry.content);
    setLocalKeys(entry.keys.join(', '));
    setShowAiPrompt(false);
    setAiPrompt('');
  }, [entry.id]);

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        localTitle !== entry.title || 
        localContent !== entry.content ||
        localKeys !== entry.keys.join(', ')
      ) {
        onUpdate({
          ...entry,
          title: localTitle,
          content: localContent,
          keys: localKeys.split(',').map(k => k.trim()).filter(k => k.length > 0),
          lastUpdated: Date.now()
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localTitle, localContent, localKeys, entry, onUpdate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeGeneration = () => {
    if (!aiPrompt.trim()) return;
    onGenerate(aiPrompt, localContent);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) { // 2MB limit warning
         alert("Image is large and might affect app performance. Recommended size < 1MB.");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...entry, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onUpdate({ ...entry, image: undefined });
  };

  // Layout logic based on Type
  const isCharacter = entry.type === EntryType.CHARACTER;
  const isLocation = entry.type === EntryType.LOCATION;
  const isItem = entry.type === EntryType.ITEM;

  return (
    <div className="flex-1 flex h-full relative overflow-hidden bg-theme-panel">
      
      {/* --- Center: Writing Area --- */}
      <div className="flex-1 flex flex-col relative h-full bg-theme-panel">
        
        {/* Top Toolbar */}
        <div className="h-14 flex items-center justify-between px-6 z-10 bg-gradient-to-b from-theme-panel to-transparent sticky top-0">
           <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowAiPrompt(!showAiPrompt)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  showAiPrompt 
                  ? 'bg-theme-accent text-theme-accent ring-1 ring-theme-accent/50' 
                  : 'bg-theme-input text-theme-secondary hover:text-theme-primary'
                }`}
             >
               <Sparkles size={14} />
               <span>AI Assistant</span>
             </button>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowInspector(!showInspector)}
                className="p-2 text-theme-secondary hover:text-theme-primary transition-colors"
                title="Toggle Inspector"
              >
                {showInspector ? <SidebarClose size={18} /> : <SidebarOpen size={18} />}
              </button>
           </div>
        </div>

        {/* Floating AI Prompt Box */}
        {showAiPrompt && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50 px-4 animate-in fade-in slide-in-from-top-2">
            <div className="bg-theme-panel/95 backdrop-blur-xl border border-theme-accent rounded-xl shadow-2xl p-4 flex flex-col gap-3">
               <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  className="w-full bg-theme-input border border-theme rounded-lg p-3 text-sm text-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-accent resize-none h-20 placeholder-theme-secondary"
                  autoFocus
                />
               <div className="flex justify-between items-center">
                  <span className="text-[10px] text-theme-secondary uppercase tracking-widest font-bold">Generation Mode</span>
                  <button 
                    onClick={executeGeneration}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-theme-accent-solid hover:opacity-90 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg"
                  >
                    {isGenerating ? <span className="animate-spin">⏳</span> : <Sparkles size={12} />}
                    {isGenerating ? 'Dreaming...' : 'Generate'}
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Main Content Scroller */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-20">
          <div className="max-w-4xl mx-auto py-8">
             
             {/* Banner for Locations */}
             {isLocation && (
               <div className="mb-8 relative group rounded-xl overflow-hidden border-2 border-theme bg-theme-input h-48 md:h-64 flex items-center justify-center">
                 {entry.image ? (
                   <>
                    <img src={entry.image} alt="Banner" className="w-full h-full object-cover" />
                    <button onClick={removeImage} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                   </>
                 ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors">
                       <ImageIcon size={48} />
                       <span className="text-sm font-medium">Upload Location Banner</span>
                       <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </label>
                 )}
               </div>
             )}

             <div className="flex flex-col md:flex-row gap-8">
                
                {/* Image Side Panel for Characters/Items */}
                {(isCharacter || isItem) && (
                  <div className={`flex-shrink-0 ${isCharacter ? 'w-full md:w-64' : 'w-32 md:w-48'} mb-6 md:mb-0`}>
                     <div className={`relative group rounded-xl overflow-hidden border-2 border-theme bg-theme-input flex items-center justify-center ${isCharacter ? 'aspect-[3/4]' : 'aspect-square'}`}>
                        {entry.image ? (
                           <>
                             <img src={entry.image} alt="Portrait" className="w-full h-full object-cover" />
                             <button onClick={removeImage} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                           </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors p-4 text-center">
                             <Upload size={32} />
                             <span className="text-xs font-medium">Upload {isCharacter ? 'Portrait' : 'Icon'}</span>
                             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                          </label>
                        )}
                     </div>
                  </div>
                )}

                {/* Text Area */}
                <div className="flex-1">
                  <input 
                      type="text"
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-4xl font-serif-writing font-bold text-theme-primary focus:ring-0 placeholder-theme-secondary/50 mb-6"
                      placeholder="Untitled Entry"
                  />
                  <textarea 
                      ref={textareaRef}
                      value={localContent}
                      onChange={(e) => setLocalContent(e.target.value)}
                      className="w-full min-h-[60vh] bg-transparent border-none p-0 text-lg font-serif-writing text-theme-primary focus:ring-0 leading-relaxed resize-none placeholder-theme-secondary/40 selection:bg-theme-accent"
                      placeholder="Once upon a time in a realm far away..."
                      spellCheck={false}
                    />
                </div>
             </div>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="absolute bottom-4 right-6 pointer-events-none opacity-50">
           <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest text-theme-secondary transition-opacity ${localContent !== entry.content ? 'opacity-100' : 'opacity-0'}`}>
              <Save size={10} /> Saving...
           </div>
        </div>
      </div>

      {/* --- Right: Inspector Panel --- */}
      {showInspector && (
        <div className="w-80 bg-theme-main border-l border-theme flex flex-col h-full flex-shrink-0 animate-in slide-in-from-right-10 duration-200">
           
           <div className="p-4 border-b border-theme flex items-center justify-between">
              <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest">Metadata</span>
              <div className="flex gap-1">
                <button onClick={handleCopy} className="p-1.5 hover:bg-theme-input rounded text-theme-secondary hover:text-green-500 transition-colors">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button onClick={() => onDelete(entry.id)} className="p-1.5 hover:bg-theme-input rounded text-theme-secondary hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
           </div>

           <div className="p-5 space-y-6 overflow-y-auto flex-1">
              
              {/* Entry Type */}
              <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs font-bold text-theme-secondary uppercase tracking-wide">
                    <Hash size={12} className="text-theme-accent" /> Entry Type
                 </label>
                 <div className="grid grid-cols-2 gap-2">
                    {Object.values(EntryType).map(t => (
                      <button
                        key={t}
                        onClick={() => onUpdate({ ...entry, type: t })}
                        className={`text-[10px] py-2 rounded border font-bold uppercase ${entry.type === t ? 'bg-theme-accent border-theme-accent text-theme-accent' : 'bg-theme-input border-theme text-theme-secondary hover:border-theme-primary'}`}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs font-bold text-theme-secondary uppercase tracking-wide">
                    <Tag size={12} className="text-theme-accent" /> Category
                 </label>
                 <div className="relative">
                    <select 
                      value={entry.category} 
                      onChange={(e) => onUpdate({...entry, category: e.target.value})}
                      className="w-full bg-theme-input border border-theme rounded-lg p-2.5 text-sm text-theme-primary focus:border-theme-accent focus:outline-none appearance-none transition-colors"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-theme-secondary">
                      <ChevronDownIcon size={14} />
                    </div>
                 </div>
              </div>

              {/* Activation Keys */}
              <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs font-bold text-theme-secondary uppercase tracking-wide">
                    <Tag size={12} className="text-theme-accent" /> Activation Keys
                 </label>
                 <div className="bg-theme-input border border-theme rounded-lg p-2 focus-within:border-theme-accent transition-colors">
                    <textarea 
                      value={localKeys}
                      onChange={(e) => setLocalKeys(e.target.value)}
                      className="w-full bg-transparent border-none text-sm text-theme-primary focus:ring-0 resize-none h-20 placeholder-theme-secondary font-mono leading-relaxed"
                      placeholder="dragon, fire, red..."
                    />
                 </div>
                 <p className="text-[10px] text-theme-secondary">Comma separated keywords that trigger this lore.</p>
              </div>

              {/* Stats */}
              <div className="space-y-2 pt-4 border-t border-theme">
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-theme-input p-2 rounded border border-theme">
                       <div className="text-[10px] text-theme-secondary uppercase">Words</div>
                       <div className="text-sm font-mono text-theme-primary">{localContent.trim().split(/\s+/).filter(w => w.length > 0).length}</div>
                    </div>
                    <div className="bg-theme-input p-2 rounded border border-theme">
                       <div className="text-[10px] text-theme-secondary uppercase">Chars</div>
                       <div className="text-sm font-mono text-theme-primary">{localContent.length}</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ChevronDownIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);