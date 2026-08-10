import * as fs from 'fs';

let curriculum = fs.readFileSync('src/lib/curriculum.ts', 'utf-8');
if (!curriculum.includes('dayTimes?: Record')) {
  curriculum = curriculum.replace(
    `  daysOfWeek?: number[];`,
    `  daysOfWeek?: number[];\n  dayTimes?: Record<number, { startTime: string; endTime: string }>;`
  );
  fs.writeFileSync('src/lib/curriculum.ts', curriculum);
}
