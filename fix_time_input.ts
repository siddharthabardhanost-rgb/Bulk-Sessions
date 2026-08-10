import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. We'll find where `const TimeInput12h = ` is defined, and just pull it outside the `export default function App() {` block. 
// Wait, it is using `useState`, `useRef`, `useEffect` and `AnimatePresence`, `motion` so we can just move it up right before `export default function App() {`.
// First, let's locate `const TimeInput12h =` and its closing bracket.
const timeInputStart = content.indexOf('  const TimeInput12h =');
const generateScheduleStart = content.indexOf('  const generateSchedule = async () => {');

const timeInputBody = content.substring(timeInputStart, generateScheduleStart);

// Remove it from inside App
content = content.replace(timeInputBody, '');

// Make it a top-level component, remove `label` requirement if not provided or just let it accept `label?: string`
let newTimeInputBody = timeInputBody.trim();
newTimeInputBody = newTimeInputBody.replace(
  `{ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }`,
  `{ value, onChange, label }: { value: string, onChange: (val: string) => void, label?: string }`
);
newTimeInputBody = newTimeInputBody.replace(
  `<span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>`,
  `{label && <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>}`
);
newTimeInputBody = newTimeInputBody.replace(
  `<div className={\`space-y-1.5 \${isHourOpen || isMinuteOpen ? 'relative z-[100]' : ''}\`}>`,
  `<div className={\`\${label ? 'space-y-1.5' : ''} \${isHourOpen || isMinuteOpen ? 'relative z-[100]' : ''}\`}>`
);

// Insert it before `export default function App()`
const appStart = content.indexOf('export default function App() {');
content = content.slice(0, appStart) + newTimeInputBody + '\n\n' + content.slice(appStart);

// Now update `SortablePhase` to use `TimeInput12h` instead of `<input type="time" ... />`
const oldInput1 = `<input 
                          type="time" 
                          value={st}
                          onChange={(e) => onUpdatePhase(phase.id, { 
                            dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: e.target.value, endTime: et } } 
                          })}
                          className="flex-1 bg-white/5 border border-brand-border rounded-lg px-1.5 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
                          onPointerDown={(e) => e.stopPropagation()}
                        />`;
const oldInput2 = `<input 
                          type="time" 
                          value={et}
                          onChange={(e) => onUpdatePhase(phase.id, { 
                            dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: st, endTime: e.target.value } } 
                          })}
                          className="flex-1 bg-white/5 border border-brand-border rounded-lg px-1.5 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
                          onPointerDown={(e) => e.stopPropagation()}
                        />`;
                        
const oldInput3 = `<input 
                    type="time" 
                    value={phase.startTime || ''}
                    onChange={(e) => onUpdatePhase(phase.id, { startTime: e.target.value })}
                    className="flex-1 bg-white/5 border border-brand-border rounded-lg px-1.5 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
                    onPointerDown={(e) => e.stopPropagation()}
                  />`;

const oldInput4 = `<input 
                    type="time" 
                    value={phase.endTime || ''}
                    onChange={(e) => onUpdatePhase(phase.id, { endTime: e.target.value })}
                    className="flex-1 bg-white/5 border border-brand-border rounded-lg px-1.5 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
                    onPointerDown={(e) => e.stopPropagation()}
                  />`;

content = content.replace(oldInput1, `<div onPointerDown={(e) => e.stopPropagation()} className="flex-1 min-w-[100px]"><TimeInput12h value={st || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: val, endTime: et } } })} /></div>`);
content = content.replace(oldInput2, `<div onPointerDown={(e) => e.stopPropagation()} className="flex-1 min-w-[100px]"><TimeInput12h value={et || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: st, endTime: val } } })} /></div>`);
content = content.replace(oldInput3, `<div onPointerDown={(e) => e.stopPropagation()} className="flex-1 min-w-[100px]"><TimeInput12h value={phase.startTime || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { startTime: val })} /></div>`);
content = content.replace(oldInput4, `<div onPointerDown={(e) => e.stopPropagation()} className="flex-1 min-w-[100px]"><TimeInput12h value={phase.endTime || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { endTime: val })} /></div>`);

fs.writeFileSync('src/App.tsx', content);
