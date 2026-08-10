import * as fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const targetUI = `        <div className="flex items-center gap-2">
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
        </div>`;

const newUI = `        {(() => {
          const activeDays = phase.daysOfWeek && phase.daysOfWeek.length > 0 
            ? phase.daysOfWeek 
            : (phase.dayOfWeek !== undefined && phase.dayOfWeek !== 'all' ? [phase.dayOfWeek] : []);
            
          if (activeDays.length > 0) {
            return (
              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-white/10">
                {activeDays.sort().map(dayVal => {
                  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayVal];
                  const st = phase.dayTimes?.[dayVal]?.startTime || phase.startTime || '';
                  const et = phase.dayTimes?.[dayVal]?.endTime || phase.endTime || '';
                  
                  return (
                    <div key={dayVal} className="flex items-center gap-2">
                      <label className="text-[10px] text-brand-accent-teal uppercase font-bold w-12 shrink-0">{dayName}</label>
                      <div className="flex items-center gap-1 flex-1">
                        <input 
                          type="time" 
                          value={st}
                          onChange={(e) => onUpdatePhase(phase.id, { 
                            dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: e.target.value, endTime: et } } 
                          })}
                          className="flex-1 bg-white/5 border border-brand-border rounded-lg px-1.5 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
                          onPointerDown={(e) => e.stopPropagation()}
                        />
                        <span className="text-[10px] text-slate-500">-</span>
                        <input 
                          type="time" 
                          value={et}
                          onChange={(e) => onUpdatePhase(phase.id, { 
                            dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: st, endTime: e.target.value } } 
                          })}
                          className="flex-1 bg-white/5 border border-brand-border rounded-lg px-1.5 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
                          onPointerDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            return (
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
            );
          }
        })()}`;

app = app.replace(targetUI, newUI);
fs.writeFileSync('src/App.tsx', app);
