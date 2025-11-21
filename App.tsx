import React, { useState, useEffect, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { Download, Upload, Save, Sparkles, Settings2, Wand2, Layout, Key } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import BusinessForm from './components/BusinessForm';
import PersonaBuilder from './components/PersonaBuilder';
import JourneyCanvas from './components/JourneyCanvas';
import OptimizationPanel from './components/OptimizationPanel';

import { BusinessData, Persona, JourneyMap, OptimizationResult, AIResponseJourneyStage } from './types';
import { DEFAULT_BUSINESS_DATA, EMPTY_JOURNEY } from './constants';
import { generateJourneyAI, optimizeJourneyAI, suggestStageItemsAI } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [businessData, setBusinessData] = useState<BusinessData>(DEFAULT_BUSINESS_DATA);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [journeyMap, setJourneyMap] = useState<JourneyMap>(EMPTY_JOURNEY);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult | null>(null);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showOptimization, setShowOptimization] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('cj_api_key');
    const savedBusiness = localStorage.getItem('cj_business');
    const savedPersonas = localStorage.getItem('cj_personas');
    const savedJourney = localStorage.getItem('cj_journey');

    if (savedKey) setApiKey(savedKey);
    if (savedBusiness) setBusinessData(JSON.parse(savedBusiness));
    if (savedPersonas) setPersonas(JSON.parse(savedPersonas));
    if (savedJourney) setJourneyMap(JSON.parse(savedJourney));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('cj_api_key', apiKey);
    localStorage.setItem('cj_business', JSON.stringify(businessData));
    localStorage.setItem('cj_personas', JSON.stringify(personas));
    localStorage.setItem('cj_journey', JSON.stringify(journeyMap));
  }, [apiKey, businessData, personas, journeyMap]);

  const handleGenerateJourney = async () => {
    if (!apiKey) {
      alert("Please enter your Google Gemini API Key in the settings panel on the left.");
      return;
    }
    if (!businessData.name || !businessData.offer) {
      alert("Please fill in the business details first.");
      return;
    }

    setIsGenerating(true);
    try {
      const activePersona = personas.find(p => p.id === activePersonaId);
      const aiResponse = await generateJourneyAI(apiKey, businessData, activePersona);
      
      // Transform AI response to internal format
      const newMap: JourneyMap = JSON.parse(JSON.stringify(EMPTY_JOURNEY));
      
      aiResponse.forEach((stageData: AIResponseJourneyStage) => {
        const stageId = stageData.stage.toLowerCase();
        if (newMap.stages[stageId]) {
          const createItems = (contentList: string[], type: any) => 
            contentList.map(content => ({ id: uuidv4(), content, type }));

          newMap.stages[stageId].items = [
            ...createItems(stageData.customer_thoughts, 'emotion'),
            ...createItems(stageData.touchpoints, 'touchpoint'),
            ...createItems(stageData.automations, 'automation'),
            ...createItems(stageData.content, 'content'),
            ...createItems(stageData.risks, 'risk'),
          ];
        }
      });

      setJourneyMap(newMap);
    } catch (error) {
      alert("Failed to generate journey. Please check your API key and try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async () => {
    if (!apiKey) {
      alert("Please enter your Google Gemini API Key in the settings panel.");
      return;
    }
    setIsOptimizing(true);
    setShowOptimization(true);
    try {
      const result = await optimizeJourneyAI(apiKey, businessData, journeyMap);
      setOptimizationResults({
        bottlenecks: result.bottlenecks,
        quickWins: result.quick_wins,
        automations: result.automation_opportunities,
        agents: result.ai_agents_to_build,
        contentGaps: result.content_gaps
      });
    } catch (error) {
      console.error(error);
      alert("Optimization failed. Check API Key.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleStageSuggestion = async (stageId: string) => {
    if (!apiKey) {
      alert("Please enter your Google Gemini API Key in the settings panel.");
      return;
    }
    const stage = journeyMap.stages[stageId];
    const existingContent = stage.items.map(i => i.content);
    
    const suggestions = await suggestStageItemsAI(apiKey, stage.title, businessData, existingContent);
    
    if (suggestions.length > 0) {
      const newItems = suggestions.map(s => ({
        id: uuidv4(),
        content: s,
        type: 'touchpoint' as const // Default to touchpoint for suggestions
      }));
      
      const newMap = { ...journeyMap };
      newMap.stages[stageId].items = [...newMap.stages[stageId].items, ...newItems];
      setJourneyMap(newMap);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startStage = journeyMap.stages[source.droppableId];
    const finishStage = journeyMap.stages[destination.droppableId];

    if (startStage === finishStage) {
      const newItems = Array.from(startStage.items);
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);

      const newStage = { ...startStage, items: newItems };
      setJourneyMap({
        ...journeyMap,
        stages: { ...journeyMap.stages, [newStage.id]: newStage }
      });
      return;
    }

    // Moving from one list to another
    const startItems = Array.from(startStage.items);
    const [movedItem] = startItems.splice(source.index, 1);
    const newStart = { ...startStage, items: startItems };

    const finishItems = Array.from(finishStage.items);
    finishItems.splice(destination.index, 0, movedItem);
    const newFinish = { ...finishStage, items: finishItems };

    setJourneyMap({
      ...journeyMap,
      stages: {
        ...journeyMap.stages,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ businessData, personas, journeyMap }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `journey_map_${new Date().toISOString().slice(0,10)}.json`;
    link.href = url;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.businessData) setBusinessData(data.businessData);
        if (data.personas) setPersonas(data.personas);
        if (data.journeyMap) setJourneyMap(data.journeyMap);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Top Nav */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layout size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AI Customer Journey Mapper
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
           <label className="cursor-pointer hover:bg-slate-800 p-2 rounded transition text-slate-400 hover:text-white" title="Import JSON">
             <Upload size={18} />
             <input type="file" onChange={handleImport} className="hidden" accept=".json"/>
           </label>
           <button onClick={handleExport} className="hover:bg-slate-800 p-2 rounded transition text-slate-400 hover:text-white" title="Export JSON">
             <Download size={18} />
           </button>
           <button className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium border border-slate-700 transition flex items-center gap-2">
             <Save size={14} /> Save
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className={`w-80 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-10 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full w-0 opacity-0'} absolute md:relative h-full`}>
           <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
             
             {/* API Key Section */}
             <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Key size={12} /> API Configuration
                </h2>
                <div className="space-y-2">
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none placeholder-slate-600"
                    placeholder="Paste API key here..."
                  />
                  <div className="flex justify-end">
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                    >
                      Get API Key ↗
                    </a>
                  </div>
                </div>
             </div>

             <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Business Context</h2>
             <BusinessForm data={businessData} onChange={setBusinessData} />
             
             <div className="my-6 border-t border-slate-800"></div>
             
             <PersonaBuilder 
               personas={personas} 
               activePersonaId={activePersonaId}
               onAdd={(p) => { setPersonas([...personas, p]); setActivePersonaId(p.id); }}
               onSelect={setActivePersonaId}
               onDelete={(id) => {
                 setPersonas(personas.filter(p => p.id !== id));
                 if (activePersonaId === id) setActivePersonaId(null);
               }}
             />
           </div>
           
           <div className="p-5 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
             <button 
               onClick={handleGenerateJourney}
               disabled={isGenerating}
               className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-900/20 font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isGenerating ? (
                 <>Processing...</>
               ) : (
                 <><Wand2 size={18} /> Generate Journey</>
               )}
             </button>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="h-12 bg-slate-950/80 border-b border-slate-800/50 flex items-center justify-between px-6 backdrop-blur-sm">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400">
               <Settings2 size={18} />
             </button>

             <div className="flex items-center gap-4">
               <span className="text-xs text-slate-500">
                 {activePersonaId 
                   ? `Viewing as: ${personas.find(p => p.id === activePersonaId)?.name}` 
                   : "Viewing Generic Journey"}
               </span>
               <button 
                 onClick={handleOptimize}
                 className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium flex items-center gap-2 transition-colors"
               >
                 <Sparkles size={14} /> Optimize
               </button>
             </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>
            <JourneyCanvas 
              map={journeyMap} 
              onDragEnd={onDragEnd} 
              onAddItem={() => {}} // Placeholder
              onSuggestion={handleStageSuggestion}
            />
          </div>
        </main>

        {/* Right Sidebar (Optimization) */}
        {showOptimization && (
          <aside className="w-96 h-full absolute right-0 top-0 z-30 animate-slideInRight md:relative border-l border-slate-800">
             <OptimizationPanel 
               results={optimizationResults} 
               isLoading={isOptimizing}
               onClose={() => setShowOptimization(false)}
             />
          </aside>
        )}

      </div>
    </div>
  );
};

export default App;