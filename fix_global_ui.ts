import * as fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

const targetUI = `                  {/* Editable Titles & Drag-and-Drop Grouping */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Layers size={16} className="text-brand-accent-violet" />
                        Session Titles & Phase Grouping
                      </h3>
                      <button
                        onClick={addPhase}
                        className="flex items-center gap-1.5 text-xs font-bold text-brand-accent-teal hover:text-white transition-colors border border-brand-accent-teal/40 hover:bg-gradient-to-r from-brand-accent-violet to-brand-accent-teal border-none shadow-glow text-white px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        <Plus size={14} />
                        Add Phase
                      </button>
                    </div>`;

const replaceUI = `                  {/* Editable Titles & Drag-and-Drop Grouping */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Layers size={16} className="text-brand-accent-violet" />
                        Session Titles & Phase Grouping
                      </h3>
                      <button
                        onClick={addPhase}
                        className="flex items-center gap-1.5 text-xs font-bold text-brand-accent-teal hover:text-white transition-colors border border-brand-accent-teal/40 hover:bg-gradient-to-r from-brand-accent-violet to-brand-accent-teal border-none shadow-glow text-white px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        <Plus size={14} />
                        Add Phase
                      </button>
                    </div>
                    
                    {/* Global Phase Details (Batches & Links) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-brand-border">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                          <Users size={12} className="text-brand-accent-violet" />
                          Global Batches (For Live Sessions)
                        </label>
                        <input 
                          type="text" 
                          value={(blueprint.globalBatches || []).join(', ')}
                          onChange={(e) => setBlueprint(prev => ({ ...prev, globalBatches: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                          placeholder="e.g. Batch A, Batch B"
                          className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                          <LinkIcon size={12} className="text-brand-accent-teal" />
                          Saturday Session Link
                        </label>
                        <input 
                          type="text" 
                          value={blueprint.globalSaturdayLink || ''}
                          onChange={(e) => setBlueprint(prev => ({ ...prev, globalSaturdayLink: e.target.value }))}
                          placeholder="https://zoom.us/..."
                          className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-teal/20 focus:border-brand-accent-teal/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                          <LinkIcon size={12} className="text-brand-accent-teal" />
                          Sunday Session Link
                        </label>
                        <input 
                          type="text" 
                          value={blueprint.globalSundayLink || ''}
                          onChange={(e) => setBlueprint(prev => ({ ...prev, globalSundayLink: e.target.value }))}
                          placeholder="https://zoom.us/..."
                          className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-teal/20 focus:border-brand-accent-teal/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                        />
                      </div>
                    </div>
`;

appContent = appContent.replace(targetUI, replaceUI);

const targetGenLink = `            sessionLink: blueprint.globalSessionLink || '',`;
const replaceGenLink = `            sessionLink: dayOfWeek === 6 ? (blueprint.globalSaturdayLink || '') : dayOfWeek === 0 ? (blueprint.globalSundayLink || '') : '',`;

appContent = appContent.replace(targetGenLink, replaceGenLink);

if (!appContent.includes('Link as LinkIcon')) {
  appContent = appContent.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1, Link as LinkIcon} from 'lucide-react';");
}

fs.writeFileSync('src/App.tsx', appContent);
console.log('done');
