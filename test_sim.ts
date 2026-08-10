import { set, addDays, getDay, eachDayOfInterval } from 'date-fns';

const allDays = eachDayOfInterval({ start: new Date('2026-08-01'), end: new Date('2026-08-30') });
let liveDayIndex = 0;
const curriculumManagerList = [
  { name: 'Session 1', phaseId: 'p1', phase: { daysOfWeek: [0, 6] } },
  { name: 'Session 2', phaseId: 'p1', phase: { daysOfWeek: [0, 6] } },
  { name: 'Session 3', phaseId: 'p2', phase: { daysOfWeek: [0, 6] } }
];

let generated = 0;
for (const item of curriculumManagerList) {
  let foundDay = false;
  const phase = item.phase;
  
  while (liveDayIndex < allDays.length) {
    const date = allDays[liveDayIndex];
    const dayOfWeek = getDay(date);
    
    let isValidDay = true;
    if (phase.daysOfWeek && !phase.daysOfWeek.includes(dayOfWeek)) {
      isValidDay = false;
    }
    
    if (isValidDay) {
      foundDay = true;
      generated++;
      liveDayIndex++;
      break;
    } else {
      liveDayIndex++;
    }
  }
  if (!foundDay) {
    console.log("Not found for", item.name);
    break;
  }
}
console.log("Generated:", generated);
