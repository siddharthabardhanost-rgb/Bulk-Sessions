import * as fs from 'fs';
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

const targetAllUsedBatches = `    const allUsedBatches = timeSlots.flatMap(s => s.batch);`;
const replaceAllUsedBatches = `    const allUsedBatches = [...timeSlots.flatMap(s => s.batch), ...(blueprint.globalBatches || [])];`;

appContent = appContent.replace(targetAllUsedBatches, replaceAllUsedBatches);

fs.writeFileSync('src/App.tsx', appContent);
console.log('done');
