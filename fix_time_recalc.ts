import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  `const startStr = formatInTimeZone(startDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
        const endStr = formatInTimeZone(endDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';`,
  `let startStr = formatInTimeZone(startDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
        let endStr = formatInTimeZone(endDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';`
);

const target = `            if (phase) {
              if (phase.startTime) currentStartTime = phase.startTime;
              if (phase.endTime) currentEndTime = phase.endTime;
            }`;

const replacement = `            if (phase) {
              let changed = false;
              if (phase.startTime) { currentStartTime = phase.startTime; changed = true; }
              if (phase.endTime) { currentEndTime = phase.endTime; changed = true; }
              
              if (changed) {
                const [sH, sM] = currentStartTime.split(':').map(Number);
                const [eH, eM] = currentEndTime.split(':').map(Number);
                const sDate = set(date, { hours: sH, minutes: sM, seconds: 0 });
                let eDate = set(date, { hours: eH, minutes: eM, seconds: 0 });
                if (eDate <= sDate) eDate = addDays(eDate, 1);
                
                startStr = formatInTimeZone(sDate, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
                endStr = formatInTimeZone(eDate, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
              }
            }`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
