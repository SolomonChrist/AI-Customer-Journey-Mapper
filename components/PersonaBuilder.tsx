import React, { useState } from 'react';
import { Persona } from '../types';
import { UserPlus, Users, Trash2, Check } from 'lucide-react';

interface PersonaBuilderProps {
  personas: Persona[];
  activePersonaId: string | null;
  onAdd: (p: Persona) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const PersonaBuilder: React.FC<PersonaBuilderProps> = ({ personas, activePersonaId, onAdd, onSelect, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPersona, setNewPersona] = useState<Partial<Persona>>({});

  const handleSave = () => {
    if (newPersona.name) {
      onAdd({
        id: Date.now().toString(),
        name: newPersona.name || 'New Persona',
        demographics: newPersona.demographics || '',
        painPoints: newPersona.painPoints || '',
        behaviors: newPersona.behaviors || '',
        buyingTriggers: newPersona.buyingTriggers || ''
      });
      setNewPersona({});
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Users size={18} /> Personas
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-800 p-3 rounded border border-slate-600 space-y-3 animate-fadeIn">
          <input 
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
            placeholder="Persona Name (e.g. CTO Cindy)"
            value={newPersona.name || ''}
            onChange={e => setNewPersona({...newPersona, name: e.target.value})}
          />
          <textarea 
             className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white resize-none h-16"
             placeholder="Pain Points..."
             value={newPersona.painPoints || ''}
             onChange={e => setNewPersona({...newPersona, painPoints: e.target.value})}
          />
           <button 
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1 rounded text-xs flex items-center justify-center gap-2"
          >
            <Check size={12} /> Save Persona
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {personas.length === 0 && !isAdding && (
          <p className="text-slate-500 text-xs italic">No personas defined yet.</p>
        )}
        {personas.map(p => (
          <div 
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`p-3 rounded cursor-pointer border transition-all relative group ${
              activePersonaId === p.id 
                ? 'bg-blue-900/30 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                : 'bg-slate-800 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-slate-200 text-sm">{p.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{p.painPoints}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonaBuilder;
