import * as fs from 'fs';

let curriculum = fs.readFileSync('src/lib/curriculum.ts', 'utf-8');
if (!curriculum.includes('instructors?: string[];')) {
  curriculum = curriculum.replace(
    `  dayTimes?: Record<number, { startTime: string; endTime: string }>;`,
    `  dayTimes?: Record<number, { startTime: string; endTime: string }>;\n  instructors?: string[];\n  batches?: string[];\n  sessionLink?: string;`
  );
  fs.writeFileSync('src/lib/curriculum.ts', curriculum);
}
