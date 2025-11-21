import React from 'react';
import { OptimizationResult } from '../types';
import { AlertTriangle, Zap, Bot, Layers, Lightbulb, X } from 'lucide-react';

interface OptimizationPanelProps {
  results: OptimizationResult | null;
  isLoading: boolean;
  onClose: () => void;
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ results, isLoading, onClose }) => {
  if (!results && !isLoading) return null;

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur">
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          AI Optimization Engine
        </h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
             <p className="text-slate-400 animate-pulse">Analyzing bottlenecks & opportunities...</p>
          </div>
        ) : results ? (
          <div className="space-y-8 animate-fadeIn">
            
            <section>
              <h3 className="text-red-400 font-semibold flex items-center gap-2 mb-3">
                <AlertTriangle size={18} /> Critical Bottlenecks
              </h3>
              <ul className="space-y-2">
                {results.bottlenecks.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 bg-red-500/5 p-3 rounded border border-red-500/10">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-amber-400 font-semibold flex items-center gap-2 mb-3">
                <Zap size={18} /> Quick Wins
              </h3>
              <ul className="space-y-2">
                {results.quickWins.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 bg-amber-500/5 p-3 rounded border border-amber-500/10">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-cyan-400 font-semibold flex items-center gap-2 mb-3">
                <Bot size={18} /> AI Agents & Automation
              </h3>
              <div className="space-y-3">
                 {results.automations.map((item, i) => (
                  <div key={`auto-${i}`} className="text-sm text-slate-300 bg-cyan-500/5 p-3 rounded border border-cyan-500/10 flex gap-2">
                    <Layers size={14} className="mt-1 flex-shrink-0 opacity-50"/>
                    <span>{item}</span>
                  </div>
                ))}
                {results.agents.map((item, i) => (
                  <div key={`agent-${i}`} className="text-sm text-slate-300 bg-purple-500/5 p-3 rounded border border-purple-500/10 flex gap-2">
                    <Bot size={14} className="mt-1 flex-shrink-0 opacity-50"/>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

             <section>
              <h3 className="text-emerald-400 font-semibold flex items-center gap-2 mb-3">
                <Lightbulb size={18} /> Content Gaps
              </h3>
              <ul className="space-y-2">
                {results.contentGaps.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 bg-emerald-500/5 p-3 rounded border border-emerald-500/10">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OptimizationPanel;
