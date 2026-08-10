import * as fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const targetLogic = `            if (phase) {
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

const newLogic = `            if (phase) {
              let changed = false;
              const daySpecificTime = phase.dayTimes?.[dayOfWeek];
              
              if (daySpecificTime?.startTime || phase.startTime) { 
                currentStartTime = daySpecificTime?.startTime || phase.startTime || currentStartTime; 
                changed = true; 
              }
              if (daySpecificTime?.endTime || phase.endTime) { 
                currentEndTime = daySpecificTime?.endTime || phase.endTime || currentEndTime; 
                changed = true; 
              }
              
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

app = app.replace(targetLogic, newLogic);
fs.writeFileSync('src/App.tsx', app);
