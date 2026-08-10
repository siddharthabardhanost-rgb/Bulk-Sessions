import * as fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(
  "Slot {index + 1}: {slot.category === 'live-sessions-aig' ? `Sat ${slot.startTime} / Sun ${slot.sundayStartTime || slot.startTime}` : slot.startTime}",
  "Slot {index + 1}: {slot.startTime}"
);
fs.writeFileSync('src/App.tsx', app);
