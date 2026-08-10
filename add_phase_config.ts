import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `      <div className="flex flex-col gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-400 uppercase font-bold w-12 shrink-0">Day</label>
          <select 
            value={phase.dayOfWeek ?? 'all'}
            onChange={(e) => onUpdatePhase(phase.id, { dayOfWeek: e.target.value === 'all' ? 'all' : parseInt(e.target.value) })}
            className="flex-1 bg-white/5 border border-brand-border rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <option value="all">Any Day</option>
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-400 uppercase font-bold w-12 shrink-0">Time</label>
          <div className="flex items-center gap-1 flex-1">
            <input 
              type="time" 
              value={phase.startTime || ''}
              onChange={(e) => onUpdatePhase(phase.id, { startTime: e.target.value })}
              className="flex-1 bg-white/5 border border-brand-border rounded-lg px-1.5 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
              onPointerDown={(e) => e.stopPropagation()}
            />
            <span className="text-[10px] text-slate-500">-</span>
            <input 
              type="time" 
              value={phase.endTime || ''}
              onChange={(e) => onUpdatePhase(phase.id, { endTime: e.target.value })}
              className="flex-1 bg-white/5 border border-brand-border rounded-lg px-1.5 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
      
      <SortableContext`;

content = content.replace(
  `      <SortableContext`,
  replacement
);

fs.writeFileSync('src/App.tsx', content);
