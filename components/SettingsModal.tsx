import React, { useState } from 'react';
import { AppSettings, AIProvider, AppTheme } from '../types';
import { X, Server, Cloud, Cpu, BookOpen, Palette, Monitor } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'ai' | 'appearance'>('ai');

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const updateAiSetting = (key: keyof typeof settings.ai, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      ai: { ...prev.ai, [key]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-theme-panel border border-theme rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme">
          <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
            <SettingsIcon tab={activeTab} />
            Configuration
          </h2>
          <button onClick={onClose} className="text-theme-secondary hover:text-theme-primary transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-theme">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'ai' ? 'text-theme-accent border-b-2 border-theme-accent bg-theme-accent' : 'text-theme-secondary hover:bg-theme-main/50'}`}
          >
            AI Generation
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'appearance' ? 'text-theme-accent border-b-2 border-theme-accent bg-theme-accent' : 'text-theme-secondary hover:bg-theme-main/50'}`}
          >
            Appearance
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto bg-theme-panel">
          
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
              {/* Provider Selection */}
              <div className="grid grid-cols-3 gap-2">
                <ProviderButton 
                  active={localSettings.ai.provider === AIProvider.GEMINI}
                  onClick={() => updateAiSetting('provider', AIProvider.GEMINI)}
                  icon={<Cloud size={24} />}
                  label="Gemini"
                />
                <ProviderButton 
                  active={localSettings.ai.provider === AIProvider.NOVELAI}
                  onClick={() => updateAiSetting('provider', AIProvider.NOVELAI)}
                  icon={<BookOpen size={24} />}
                  label="NovelAI"
                />
                <ProviderButton 
                  active={localSettings.ai.provider === AIProvider.LOCAL}
                  onClick={() => updateAiSetting('provider', AIProvider.LOCAL)}
                  icon={<Server size={24} />}
                  label="Local"
                />
              </div>

              {/* Dynamic Settings */}
              {localSettings.ai.provider === AIProvider.GEMINI && (
                <div className="space-y-4">
                  <InfoBox color="blue">Using Google Gemini 3 Flash Preview via server-side API Key.</InfoBox>
                  <InputGroup label="Model Name">
                    <input 
                        type="text" 
                        value={localSettings.ai.geminiModelName}
                        onChange={(e) => updateAiSetting('geminiModelName', e.target.value)}
                        className="w-full bg-theme-input border border-theme rounded p-2 text-theme-primary focus:border-theme-accent focus:outline-none"
                    />
                  </InputGroup>
                </div>
              )}

              {localSettings.ai.provider === AIProvider.NOVELAI && (
                <div className="space-y-4">
                  <InfoBox color="purple">Requires a valid NovelAI API Key (Bearer Token).</InfoBox>
                  <InputGroup label="API Key">
                    <input 
                        type="password" 
                        value={localSettings.ai.novelAiApiKey || ''}
                        onChange={(e) => updateAiSetting('novelAiApiKey', e.target.value)}
                        className="w-full bg-theme-input border border-theme rounded p-2 text-theme-primary focus:border-theme-accent focus:outline-none font-mono text-sm"
                        placeholder="pst-..."
                    />
                  </InputGroup>
                </div>
              )}

              {localSettings.ai.provider === AIProvider.LOCAL && (
                <div className="space-y-4">
                  <InfoBox color="green">Connects to KoboldCPP/LMStudio via /v1 endpoints.</InfoBox>
                  <InputGroup label="API Base URL">
                    <input 
                        type="text" 
                        value={localSettings.ai.localBaseUrl}
                        onChange={(e) => updateAiSetting('localBaseUrl', e.target.value)}
                        className="w-full bg-theme-input border border-theme rounded p-2 text-theme-primary focus:border-theme-accent focus:outline-none font-mono text-sm"
                        placeholder="http://localhost:5001/v1"
                    />
                  </InputGroup>
                  <InputGroup label="Model Name">
                    <input 
                        type="text" 
                        value={localSettings.ai.localModelName}
                        onChange={(e) => updateAiSetting('localModelName', e.target.value)}
                        className="w-full bg-theme-input border border-theme rounded p-2 text-theme-primary focus:border-theme-accent focus:outline-none"
                    />
                  </InputGroup>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-theme">
                <InputGroup label={`Temperature (${localSettings.ai.temperature})`}>
                    <input 
                      type="range" 
                      min="0.1" max="2.0" step="0.1"
                      value={localSettings.ai.temperature}
                      onChange={(e) => updateAiSetting('temperature', parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                </InputGroup>
                <InputGroup label="Max Tokens">
                    <input 
                      type="number" 
                      value={localSettings.ai.maxTokens}
                      onChange={(e) => updateAiSetting('maxTokens', parseInt(e.target.value))}
                      className="w-full bg-theme-input border border-theme rounded p-2 text-theme-primary focus:border-theme-accent focus:outline-none"
                    />
                </InputGroup>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wider">Color Theme</h3>
                   <div className="grid grid-cols-3 gap-3">
                      <ThemeOption 
                        name="midnight" 
                        label="Midnight" 
                        active={localSettings.theme === 'midnight'} 
                        onSelect={() => setLocalSettings({...localSettings, theme: 'midnight'})}
                        colors={['#02040a', '#1e293b', '#d97706']}
                      />
                      <ThemeOption 
                        name="nebula" 
                        label="Nebula" 
                        active={localSettings.theme === 'nebula'} 
                        onSelect={() => setLocalSettings({...localSettings, theme: 'nebula'})}
                        colors={['#1e1b2e', '#3e3859', '#c084fc']}
                      />
                      <ThemeOption 
                        name="parchment" 
                        label="Parchment" 
                        active={localSettings.theme === 'parchment'} 
                        onSelect={() => setLocalSettings({...localSettings, theme: 'parchment'})}
                        colors={['#fcf7ee', '#dcc8b0', '#a05e2a']}
                      />
                   </div>
                </div>
             </div>
          )}

        </div>

        <div className="p-5 border-t border-theme flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-theme-accent-solid hover:opacity-90 text-white rounded font-medium shadow-lg">Save Configuration</button>
        </div>
      </div>
    </div>
  );
};

const SettingsIcon = ({ tab }: { tab: string }) => {
  return tab === 'ai' ? <Cpu className="text-theme-accent" /> : <Palette className="text-theme-accent" />;
};

const ProviderButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
      active 
        ? 'bg-theme-accent border-theme-accent text-theme-accent' 
        : 'bg-theme-input border-theme text-theme-secondary hover:bg-theme-panel'
    }`}
  >
    {icon}
    <span className="font-semibold text-xs">{label}</span>
  </button>
);

const InputGroup = ({ label, children }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-theme-secondary uppercase">{label}</label>
    {children}
  </div>
);

const InfoBox = ({ color, children }: any) => {
  // Simple map for styling based on color, in a real app better to use generic theme classes
  const styles: any = {
    blue: "bg-blue-900/20 border-blue-800 text-blue-200",
    purple: "bg-purple-900/20 border-purple-800 text-purple-200",
    green: "bg-green-900/20 border-green-800 text-green-200"
  };
  return <div className={`p-4 border rounded text-sm ${styles[color] || styles.blue}`}>{children}</div>
};

const ThemeOption = ({ name, label, active, onSelect, colors }: any) => (
  <button 
    onClick={onSelect}
    className={`group relative h-24 rounded-xl border-2 transition-all overflow-hidden ${active ? 'border-theme-accent ring-2 ring-theme-accent/30' : 'border-theme hover:border-theme-secondary'}`}
  >
    <div className="absolute inset-0 flex flex-col">
       <div className="h-1/2 w-full" style={{ backgroundColor: colors[0] }} />
       <div className="h-1/2 w-full flex">
          <div className="w-1/3 h-full" style={{ backgroundColor: colors[1] }} />
          <div className="w-2/3 h-full bg-slate-100/5" />
       </div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
       <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: colors[2] }} />
    </div>
    <div className={`absolute bottom-0 inset-x-0 p-1 text-[10px] font-bold uppercase text-center bg-black/50 text-white backdrop-blur-sm`}>
       {label}
    </div>
  </button>
);