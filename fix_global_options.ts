import * as fs from 'fs';

// 1. Update curriculum.ts
let curContent = fs.readFileSync('src/lib/curriculum.ts', 'utf-8');
curContent = curContent.replace(
`export interface CurriculumBlueprint {
  phases: CurriculumPhase[];
  batchPhaseIds: Record<string, Record<string, string>>; // Batch -> PhaseID -> CourseID
}`,
`export interface CurriculumBlueprint {
  phases: CurriculumPhase[];
  batchPhaseIds: Record<string, Record<string, string>>; // Batch -> PhaseID -> CourseID
  globalBatches?: string[];
  globalSessionLink?: string;
}`);
curContent = curContent.replace(
`export const DEFAULT_CURRICULUM_BLUEPRINT: CurriculumBlueprint = {
  phases: [`,
`export const DEFAULT_CURRICULUM_BLUEPRINT: CurriculumBlueprint = {
  globalBatches: [],
  globalSessionLink: '',
  phases: [`);
fs.writeFileSync('src/lib/curriculum.ts', curContent);

// 2. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove batches and sessionLink from SortablePhase
const targetPhaseFields = `          <div className="flex items-center gap-2">
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
          </div>`;
appContent = appContent.replace(targetPhaseFields, '');

// Inject global Batches and Session Link inputs before DndContext
const targetGroupingHeader = `                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5">
                        <Layers size={14} className="text-brand-accent-violet" />
                        Session Titles & Phase Grouping
                      </label>
                      <button 
                        onClick={addPhase}
                        className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-brand-accent-teal transition-colors"
                      >
                        <Plus size={14} />
                        Add Phase
                      </button>
                    </div>
                    <DndContext`;

const replaceGroupingHeader = `                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-brand-border">
                      <div className="flex-1 space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5">
                          <Users size={14} className="text-brand-accent-violet" />
                          Global Batches
                        </label>
                        <input 
                          type="text" 
                          value={(blueprint.globalBatches || []).join(', ')}
                          onChange={(e) => setBlueprint(prev => ({ ...prev, globalBatches: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                          placeholder="e.g. Batch A, Batch B"
                          className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5">
                          <LinkIcon size={14} className="text-brand-accent-violet" />
                          Global Session Link
                        </label>
                        <input 
                          type="text" 
                          value={blueprint.globalSessionLink || ''}
                          onChange={(e) => setBlueprint(prev => ({ ...prev, globalSessionLink: e.target.value }))}
                          placeholder="https://zoom.us/..."
                          className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5">
                        <Layers size={14} className="text-brand-accent-violet" />
                        Session Titles & Phase Grouping
                      </label>
                      <button 
                        onClick={addPhase}
                        className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-brand-accent-teal transition-colors"
                      >
                        <Plus size={14} />
                        Add Phase
                      </button>
                    </div>
                    <DndContext`;

appContent = appContent.replace(targetGroupingHeader, replaceGroupingHeader);

// Now fix the scheduling logic to use globalBatches and globalSessionLink
// In the generation logic:
// const activeBatches = phase.batches || [];
// to 
// const activeBatches = blueprint.globalBatches || [];
appContent = appContent.replace(/const activeBatches = phase\.batches \|\| \[\];/g, 'const activeBatches = blueprint.globalBatches || [];');

// sessionLink: phase.sessionLink || '',
// to
// sessionLink: blueprint.globalSessionLink || '',
appContent = appContent.replace(/sessionLink: phase\.sessionLink \|\| '',/g, 'sessionLink: blueprint.globalSessionLink || \'\',');

// Also update the import for LinkIcon if needed.
if (!appContent.includes('Link as LinkIcon')) {
  appContent = appContent.replace(/import \{([^}]+)\} from 'lucide-react';/g, "import {$1, Link as LinkIcon} from 'lucide-react';");
}


fs.writeFileSync('src/App.tsx', appContent);
console.log('done');
