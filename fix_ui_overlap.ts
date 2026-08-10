import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `<div className="flex items-center gap-1 flex-1">
                        <div onPointerDown={(e) => e.stopPropagation()} className="flex-1 min-w-[100px]"><TimeInput12h value={st || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: val, endTime: et } } })} /></div>
                        <span className="text-[10px] text-slate-500">-</span>
                        <div onPointerDown={(e) => e.stopPropagation()} className="flex-1 min-w-[100px]"><TimeInput12h value={et || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: st, endTime: val } } })} /></div>
                      </div>`;

const replace1 = `<div className="flex flex-col 2xl:flex-row items-start 2xl:items-center gap-1 flex-1">
                        <div onPointerDown={(e) => e.stopPropagation()} className="w-full 2xl:w-auto 2xl:flex-1 min-w-0"><TimeInput12h value={st || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: val, endTime: et } } })} /></div>
                        <span className="hidden 2xl:block text-[10px] text-slate-500">-</span>
                        <div onPointerDown={(e) => e.stopPropagation()} className="w-full 2xl:w-auto 2xl:flex-1 min-w-0"><TimeInput12h value={et || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: st, endTime: val } } })} /></div>
                      </div>`;

const target2 = `<div className="flex items-center gap-1 flex-1">
                  <div onPointerDown={(e) => e.stopPropagation()} className="flex-1 min-w-[100px]"><TimeInput12h value={phase.startTime || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { startTime: val })} /></div>
                  <span className="text-[10px] text-slate-500">-</span>
                  <div onPointerDown={(e) => e.stopPropagation()} className="flex-1 min-w-[100px]"><TimeInput12h value={phase.endTime || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { endTime: val })} /></div>
                </div>`;

const replace2 = `<div className="flex flex-col 2xl:flex-row items-start 2xl:items-center gap-1 flex-1">
                  <div onPointerDown={(e) => e.stopPropagation()} className="w-full 2xl:w-auto 2xl:flex-1 min-w-0"><TimeInput12h value={phase.startTime || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { startTime: val })} /></div>
                  <span className="hidden 2xl:block text-[10px] text-slate-500">-</span>
                  <div onPointerDown={(e) => e.stopPropagation()} className="w-full 2xl:w-auto 2xl:flex-1 min-w-0"><TimeInput12h value={phase.endTime || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { endTime: val })} /></div>
                </div>`;

// Also reduce padding in TimeInput12h to make it more compact
const target3 = `<div className="flex items-center gap-1.5 bg-white/5 border border-brand-border rounded-xl px-3 py-2 shadow-sm  focus-within:ring-brand-accent-violet/20 focus-within:border-brand-accent-violet/50 transition-all">`;
const replace3 = `<div className="flex items-center justify-between bg-white/5 border border-brand-border rounded-xl px-2 py-1.5 shadow-sm  focus-within:ring-brand-accent-violet/20 focus-within:border-brand-accent-violet/50 transition-all">`;

const target4 = `<button 
              type="button"
              onClick={() => { setIsHourOpen(!isHourOpen); setIsMinuteOpen(false); }}
              className="text-sm font-semibold focus:outline-none cursor-pointer text-slate-200 hover:text-brand-accent-teal transition-colors min-w-[24px] text-center"
            >`;
const replace4 = `<button 
              type="button"
              onClick={() => { setIsHourOpen(!isHourOpen); setIsMinuteOpen(false); }}
              className="text-xs font-semibold focus:outline-none cursor-pointer text-slate-200 hover:text-brand-accent-teal transition-colors min-w-[18px] text-center"
            >`;

const target5 = `<button 
              type="button"
              onClick={() => { setIsMinuteOpen(!isMinuteOpen); setIsHourOpen(false); }}
              className="text-sm font-semibold focus:outline-none cursor-pointer text-slate-200 hover:text-brand-accent-teal transition-colors min-w-[24px] text-center"
            >`;
const replace5 = `<button 
              type="button"
              onClick={() => { setIsMinuteOpen(!isMinuteOpen); setIsHourOpen(false); }}
              className="text-xs font-semibold focus:outline-none cursor-pointer text-slate-200 hover:text-brand-accent-teal transition-colors min-w-[18px] text-center"
            >`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);
content = content.replace(target3, replace3);
content = content.replace(target4, replace4);
content = content.replace(target5, replace5);

fs.writeFileSync('src/App.tsx', content);
console.log('done');
