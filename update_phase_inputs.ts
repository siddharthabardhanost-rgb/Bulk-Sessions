import * as fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `        })()}
      </div>
      
      <SortableContext`;

const newFields = `        })()}
        
        {/* Phase Meta Data */}
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold w-16 shrink-0">Instructor</label>
            <input 
              type="text" 
              value={(phase.instructors || []).join(', ')}
              onChange={(e) => onUpdatePhase(phase.id, { instructors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="Instructor Name"
              className="flex-1 bg-white/5 border border-brand-border rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold w-16 shrink-0">Batches</label>
            <input 
              type="text" 
              value={(phase.batches || []).join(', ')}
              onChange={(e) => onUpdatePhase(phase.id, { batches: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="e.g. Batch A, Batch B"
              className="flex-1 bg-white/5 border border-brand-border rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold w-16 shrink-0">Session Link</label>
            <input 
              type="text" 
              value={phase.sessionLink || ''}
              onChange={(e) => onUpdatePhase(phase.id, { sessionLink: e.target.value })}
              placeholder="https://..."
              className="flex-1 bg-white/5 border border-brand-border rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
      
      <SortableContext`;

app = app.replace(target, newFields);
fs.writeFileSync('src/App.tsx', app);
