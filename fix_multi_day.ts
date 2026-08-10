import * as fs from 'fs';

let curriculum = fs.readFileSync('src/lib/curriculum.ts', 'utf-8');
curriculum = curriculum.replace(
  `  dayOfWeek?: number | 'all';`,
  `  dayOfWeek?: number | 'all';\n  daysOfWeek?: number[];`
);
fs.writeFileSync('src/lib/curriculum.ts', curriculum);

let app = fs.readFileSync('src/App.tsx', 'utf-8');

// Update UI
app = app.replace(
  `<select 
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
          </select>`,
  `<div className="flex flex-wrap gap-1 flex-1">
            {[{l:'S',v:0}, {l:'M',v:1}, {l:'T',v:2}, {l:'W',v:3}, {l:'T',v:4}, {l:'F',v:5}, {l:'S',v:6}].map(d => {
              const isActive = phase.daysOfWeek?.includes(d.v) || (phase.daysOfWeek === undefined && phase.dayOfWeek === d.v);
              return (
                <button
                  key={d.v}
                  onClick={() => {
                    let current = phase.daysOfWeek;
                    if (!current) {
                      current = (phase.dayOfWeek !== undefined && phase.dayOfWeek !== 'all') ? [phase.dayOfWeek] : [];
                    }
                    if (current.includes(d.v)) {
                      onUpdatePhase(phase.id, { daysOfWeek: current.filter(x => x !== d.v), dayOfWeek: 'all' });
                    } else {
                      onUpdatePhase(phase.id, { daysOfWeek: [...current, d.v], dayOfWeek: 'all' });
                    }
                  }}
                  className={\`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors \${isActive ? 'bg-brand-accent-violet text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}\`}
                >
                  {d.l}
                </button>
              );
            })}
            {((!phase.daysOfWeek || phase.daysOfWeek.length === 0) && (phase.dayOfWeek === undefined || phase.dayOfWeek === 'all')) && <span className="text-[10px] text-slate-500 ml-1 leading-6 italic">Any</span>}
          </div>`
);

// Update logic
app = app.replace(
  `            if (phase && phase.dayOfWeek !== undefined && phase.dayOfWeek !== 'all' && phase.dayOfWeek !== dayOfWeek) {
              // The phase requires a specific day, but today is not that day. Skip scheduling this slot.
              return;
            }`,
  `            if (phase) {
              const requiresSpecificDays = phase.daysOfWeek && phase.daysOfWeek.length > 0;
              const requiresLegacyDay = phase.dayOfWeek !== undefined && phase.dayOfWeek !== 'all';
              
              if (requiresSpecificDays && !phase.daysOfWeek!.includes(dayOfWeek)) {
                return;
              } else if (!requiresSpecificDays && requiresLegacyDay && phase.dayOfWeek !== dayOfWeek) {
                return;
              }
            }`
);

fs.writeFileSync('src/App.tsx', app);
