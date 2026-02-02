import React, { useState, useEffect, useCallback } from 'react';
import { LoreBook, LoreEntry, AppSettings, EntryType, AIProvider } from './types';
import { DEFAULT_LOREBOOK, DEFAULT_APP_SETTINGS } from './constants';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { SettingsModal } from './components/SettingsModal';
import { AIService } from './services/aiService';
import { Settings, Download, Upload, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'aetherlore_book_v2';
const SETTINGS_KEY = 'aetherlore_settings_v2';

function App() {
  const [loreBook, setLoreBook] = useState<LoreBook>(DEFAULT_LOREBOOK);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(loreBook.entries[0]?.id || null);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'error' | 'success'} | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedBook = localStorage.getItem(STORAGE_KEY);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    
    if (savedBook) {
      try {
        setLoreBook(JSON.parse(savedBook));
      } catch (e) {
        console.error("Failed to parse saved lorebook", e);
      }
    }
    if (savedSettings) {
      try {
        setAppSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loreBook));
  }, [loreBook]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
  }, [appSettings]);

  // Apply Theme
  useEffect(() => {
    document.body.className = `theme-${appSettings.theme}`;
  }, [appSettings.theme]);

  // Notifications
  const notify = (msg: string, type: 'error' | 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handlers
  const handleAddEntry = () => {
    const newEntry: LoreEntry = {
      id: `entry-${Date.now()}`,
      title: 'New Entry',
      keys: [],
      content: '',
      category: 'Uncategorized',
      type: EntryType.JOURNAL, // Default type
      lastUpdated: Date.now()
    };
    setLoreBook(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
    setSelectedEntryId(newEntry.id);
  };

  const handleUpdateEntry = (updated: LoreEntry) => {
    setLoreBook(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === updated.id ? updated : e)
    }));
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setLoreBook(prev => ({
        ...prev,
        entries: prev.entries.filter(e => e.id !== id)
      }));
      if (selectedEntryId === id) setSelectedEntryId(null);
    }
  };

  const handleUpdateBookName = (name: string) => {
    setLoreBook(prev => ({ ...prev, name }));
  };

  const handleManageCategories = (action: 'add' | 'delete' | 'rename', payload: any) => {
    setLoreBook(prev => {
       const newCategories = [...prev.categories];
       let newEntries = [...prev.entries];

       if (action === 'add') {
         if (!newCategories.includes(payload)) newCategories.push(payload);
       } else if (action === 'delete') {
         const index = newCategories.indexOf(payload);
         if (index > -1) newCategories.splice(index, 1);
         // Move entries to Uncategorized
         newEntries = newEntries.map(e => e.category === payload ? { ...e, category: 'Uncategorized' } : e);
       } else if (action === 'rename') {
         const { oldName, newName } = payload;
         const index = newCategories.indexOf(oldName);
         if (index > -1) newCategories[index] = newName;
         // Update entries
         newEntries = newEntries.map(e => e.category === oldName ? { ...e, category: newName } : e);
       }
       return { ...prev, categories: newCategories, entries: newEntries };
    });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(loreBook, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${loreBook.name.replace(/\s+/g, '_').toLowerCase()}_lorebook.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Lorebook exported successfully", "success");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.entries && Array.isArray(imported.entries)) {
          setLoreBook(imported);
          setSelectedEntryId(imported.entries[0]?.id || null);
          notify("Lorebook imported successfully", "success");
        } else {
          notify("Invalid lorebook format", "error");
        }
      } catch (err) {
        notify("Failed to parse file", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (prompt: string, context: string) => {
    if (!selectedEntryId) return;
    setIsGenerating(true);
    try {
      const generatedText = await AIService.generateLore(appSettings.ai, prompt, context);
      
      setLoreBook(prev => ({
        ...prev,
        entries: prev.entries.map(e => {
          if (e.id !== selectedEntryId) return e;
          const newContent = context 
            ? `${context}\n\n${generatedText}` 
            : generatedText;
          return { ...e, content: newContent, lastUpdated: Date.now() };
        })
      }));
      notify("Generation successful", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Generation failed", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const activeEntry = loreBook.entries.find(e => e.id === selectedEntryId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-theme-main text-theme-primary font-sans">
      
      <Sidebar 
        loreBook={loreBook}
        selectedEntryId={selectedEntryId}
        onSelectEntry={setSelectedEntryId}
        onAddEntry={handleAddEntry}
        onUpdateBookName={handleUpdateBookName}
        onManageCategories={handleManageCategories}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 bg-theme-panel">
        
        <header className="h-10 border-b border-theme flex items-center justify-between px-4 flex-shrink-0 bg-theme-main">
          <div className="text-[10px] text-theme-secondary font-bold tracking-widest uppercase">
             Studio // {loreBook.name}
          </div>
          <div className="flex items-center gap-3">
            
            <label className="text-theme-secondary hover:text-theme-primary cursor-pointer transition-colors" title="Import JSON">
              <Upload size={14} />
              <input type="file" onChange={handleImport} accept=".json" className="hidden" />
            </label>

            <button 
              onClick={handleExport}
              className="text-theme-secondary hover:text-theme-primary transition-colors"
              title="Export JSON"
            >
              <Download size={14} />
            </button>
            <div className="h-3 w-px bg-theme-input mx-1" />
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 text-[10px] font-bold text-theme-secondary hover:text-theme-primary transition-colors uppercase tracking-wider"
            >
              <Settings size={12} />
              Config
            </button>
          </div>
        </header>

        {activeEntry ? (
          <Editor 
            entry={activeEntry}
            categories={loreBook.categories}
            onUpdate={handleUpdateEntry}
            onDelete={handleDeleteEntry}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-theme-secondary bg-theme-panel">
            <div className="w-16 h-16 rounded-full bg-theme-input flex items-center justify-center mb-4">
               <Settings className="text-theme-secondary" />
            </div>
            <p className="text-sm font-medium">Select an entry to begin writing.</p>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal 
          settings={appSettings} 
          onSave={setAppSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      {notification && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-2xl border flex items-center gap-3 z-[100] animate-bounce-in ${
          notification.type === 'error' 
            ? 'bg-red-900/90 border-red-800 text-red-100' 
            : 'bg-emerald-900/90 border-emerald-800 text-emerald-100'
        }`}>
          <AlertCircle size={16} />
          <span className="font-medium text-xs tracking-wide">{notification.msg}</span>
        </div>
      )}

    </div>
  );
}

export default App;