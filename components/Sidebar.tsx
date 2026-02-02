import React, { useState, useMemo } from 'react';
import { LoreBook, LoreEntry } from '../types';
import { Search, Plus, ChevronDown, ChevronRight, Book, Settings2, Trash2, Edit2, Check, X } from 'lucide-react';

interface SidebarProps {
  loreBook: LoreBook;
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  onAddEntry: () => void;
  onUpdateBookName: (name: string) => void;
  onManageCategories: (action: 'add' | 'delete' | 'rename', payload: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  loreBook, 
  selectedEntryId, 
  onSelectEntry, 
  onAddEntry,
  onUpdateBookName,
  onManageCategories
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(loreBook.categories));
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) newExpanded.delete(category);
    else newExpanded.add(category);
    setExpandedCategories(newExpanded);
  };

  const startEdit = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setEditName(cat);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName && editName !== editingCategory) {
      onManageCategories('rename', { oldName: editingCategory, newName: editName });
    }
    setEditingCategory(null);
  };

  const deleteCategory = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete category "${cat}"? Entries will be moved to Uncategorized.`)) {
       onManageCategories('delete', cat);
    }
  };

  const addCategory = () => {
    if (newCatName) {
      onManageCategories('add', newCatName);
      setNewCatName('');
      setShowCatInput(false);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return loreBook.entries;
    const lowerSearch = searchTerm.toLowerCase();
    return loreBook.entries.filter(e => 
      e.title.toLowerCase().includes(lowerSearch) || 
      e.keys.some(k => k.toLowerCase().includes(lowerSearch))
    );
  }, [loreBook.entries, searchTerm]);

  const entriesByCategory = useMemo(() => {
    const groups: Record<string, LoreEntry[]> = {};
    loreBook.categories.forEach(c => { groups[c] = []; });
    groups['Uncategorized'] = [];

    filteredEntries.forEach(entry => {
      const cat = entry.category && loreBook.categories.includes(entry.category) ? entry.category : 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(entry);
    });
    return groups;
  }, [filteredEntries, loreBook.categories]);

  return (
    <div className="w-64 bg-theme-main border-r border-theme flex flex-col h-full flex-shrink-0 text-theme-secondary">
      {/* Header */}
      <div className="p-4 border-b border-theme bg-theme-main">
        <div className="flex items-center gap-2 mb-4 text-theme-accent">
          <Book size={18} />
          <input 
            className="bg-transparent border-none text-base font-bold text-theme-primary focus:ring-0 w-full outline-none placeholder-theme-secondary transition-colors hover:text-theme-primary"
            value={loreBook.name}
            onChange={(e) => onUpdateBookName(e.target.value)}
            placeholder="Lorebook Name"
          />
        </div>
        
        <div className="relative group">
          <Search className="absolute left-2.5 top-2 text-theme-secondary group-focus-within:text-theme-accent transition-colors" size={14} />
          <input 
            type="text"
            placeholder="Filter..."
            className="w-full bg-theme-input text-xs text-theme-primary pl-8 pr-3 py-1.5 rounded border border-theme focus:border-theme-accent focus:outline-none transition-all placeholder-theme-secondary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
        {Object.entries(entriesByCategory).map(([category, entries]: [string, LoreEntry[]]) => {
          if (entries.length === 0 && category === 'Uncategorized' && !searchTerm) return null;
          const isExpanded = expandedCategories.has(category);
          const isEditing = editingCategory === category;

          return (
            <div key={category} className="group/cat">
              <div className="flex items-center justify-between pr-2 mb-1">
                 {isEditing ? (
                   <div className="flex items-center flex-1 px-1 gap-1">
                      <input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-theme-input text-xs text-theme-primary w-full rounded border border-theme px-1 py-0.5"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button onClick={saveEdit} className="text-green-500"><Check size={12}/></button>
                      <button onClick={() => setEditingCategory(null)} className="text-red-500"><X size={12}/></button>
                   </div>
                 ) : (
                    <button 
                      onClick={() => toggleCategory(category)}
                      className="flex items-center flex-1 text-left px-2 py-1 text-[10px] font-bold text-theme-secondary hover:text-theme-primary uppercase tracking-widest transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={10} className="mr-1.5" /> : <ChevronRight size={10} className="mr-1.5" />}
                      {category === 'Uncategorized' ? 'Misc' : category}
                    </button>
                 )}
                 
                 {!isEditing && category !== 'Uncategorized' && (
                   <div className="hidden group-hover/cat:flex gap-1">
                      <button onClick={(e) => startEdit(category, e)} className="text-theme-secondary hover:text-theme-primary p-0.5"><Edit2 size={10}/></button>
                      <button onClick={(e) => deleteCategory(category, e)} className="text-theme-secondary hover:text-red-400 p-0.5"><Trash2 size={10}/></button>
                   </div>
                 )}
              </div>
              
              {isExpanded && (
                <div className="space-y-0.5 ml-1">
                  {entries.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => onSelectEntry(entry.id)}
                      className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-all group border-l-2 ${
                        selectedEntryId === entry.id 
                          ? 'bg-theme-accent border-theme-accent text-theme-accent' 
                          : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-input border-transparent'
                      }`}
                    >
                      <span className="truncate font-medium">{entry.title || 'Untitled'}</span>
                    </button>
                  ))}
                  {entries.length === 0 && (
                    <div className="px-4 py-1 text-[10px] text-theme-secondary italic opacity-50">Empty</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Category UI */}
        <div className="px-2 pt-2 border-t border-theme border-dashed">
           {showCatInput ? (
             <div className="flex gap-1 animate-in fade-in">
               <input 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category Name"
                  className="bg-theme-input text-xs text-theme-primary w-full rounded border border-theme px-2 py-1"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
               />
               <button onClick={addCategory} className="bg-theme-accent-solid text-white p-1 rounded"><Check size={12}/></button>
               <button onClick={() => setShowCatInput(false)} className="text-theme-secondary hover:text-theme-primary p-1"><X size={12}/></button>
             </div>
           ) : (
             <button 
               onClick={() => setShowCatInput(true)}
               className="w-full text-left text-[10px] text-theme-secondary hover:text-theme-accent flex items-center gap-2 px-1 py-1"
             >
               <Plus size={10} /> Add Category
             </button>
           )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-theme bg-theme-main">
        <button 
          onClick={onAddEntry}
          className="flex items-center justify-center w-full py-2 px-4 bg-theme-panel border border-theme hover:bg-theme-accent-solid hover:text-white text-theme-primary rounded text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm"
        >
          <Plus size={14} className="mr-2" />
          Create Entry
        </button>
      </div>
    </div>
  );
};