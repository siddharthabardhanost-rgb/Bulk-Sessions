import * as fs from 'fs';
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

const targetCurrentActiveBatches = `  const currentActiveBatches = Array.from(new Set([
    ...recentBatches,
    ...timeSlots.flatMap(s => s.batch.filter(b => b.trim() !== ''))
  ]));`;

const replaceCurrentActiveBatches = `  const currentActiveBatches = Array.from(new Set([
    ...recentBatches,
    ...timeSlots.flatMap(s => s.batch.filter(b => b.trim() !== '')),
    ...(blueprint.globalBatches || []).filter(b => b.trim() !== '')
  ]));`;

appContent = appContent.replace(targetCurrentActiveBatches, replaceCurrentActiveBatches);

fs.writeFileSync('src/App.tsx', appContent);
console.log('done');
