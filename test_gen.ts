import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `    const schedule: GeneratedRow[] = [];`;
const replacement = `    const schedule: GeneratedRow[] = [];
    console.log("Generating schedule...", { allDays: allDays.length, filteredDays: filteredDays.length, timeSlots: timeSlots.length, phases: blueprint.phases.length });`;

content = content.replace(target, replacement);

const target2 = `    setGeneratedSchedule(finalSchedule);`;
const replacement2 = `    console.log("Final schedule generated:", finalSchedule.length);
    setGeneratedSchedule(finalSchedule);`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/App.tsx', content);
console.log('done');
