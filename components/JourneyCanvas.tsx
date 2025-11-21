import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { JourneyMap, JourneyItem } from '../types';
import { ITEM_TYPE_COLORS, ITEM_TYPE_LABELS } from '../constants';
import { GripVertical, Plus, Sparkles } from 'lucide-react';

interface JourneyCanvasProps {
  map: JourneyMap;
  onDragEnd: (result: DropResult) => void;
  onAddItem: (stageId: string) => void;
  onSuggestion: (stageId: string) => void;
}

const JourneyCanvas: React.FC<JourneyCanvasProps> = ({ map, onDragEnd, onAddItem, onSuggestion }) => {
  return (
    <div className="h-full w-full overflow-x-auto bg-slate-950/50 p-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full min-w-max pb-4">
          {map.stageOrder.map((stageId, index) => {
            const stage = map.stages[stageId];
            return (
              <div 
                key={stageId} 
                className="w-80 flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800/60 backdrop-blur-sm"
              >
                {/* Stage Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-gradient-to-b from-slate-800/50 to-transparent rounded-t-xl">
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-sm">
                    {index + 1}. {stage.title}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                    {stage.items.length}
                  </span>
                </div>

                {/* Drop Zone */}
                <Droppable droppableId={stageId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors ${
                        snapshot.isDraggingOver ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      {stage.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                mb-3 p-3 rounded-lg border backdrop-blur-md shadow-sm group select-none
                                ${ITEM_TYPE_COLORS[item.type]}
                                ${snapshot.isDragging ? 'shadow-xl scale-105 rotate-1' : 'hover:border-opacity-70'}
                              `}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-bold uppercase opacity-70 tracking-tighter">
                                  {ITEM_TYPE_LABELS[item.type]}
                                </span>
                                <GripVertical size={14} className="opacity-0 group-hover:opacity-50 cursor-grab" />
                              </div>
                              <p className="text-sm mt-1 leading-relaxed font-medium text-slate-100/90">
                                {item.content}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Footer Actions */}
                <div className="p-3 border-t border-slate-800 flex gap-2">
                   <button 
                    onClick={() => onSuggestion(stageId)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
                    title="AI Suggest items"
                   >
                    <Sparkles size={14} /> Suggest
                   </button>
                   {/* Manual add could be implemented here, simplified for now */}
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default JourneyCanvas;
