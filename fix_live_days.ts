import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `    let dayIndex = 0;
    
    for (const item of curriculumManagerList) {
      let foundDay = false;
      const phase = item.phase;
      
      while (dayIndex < filteredDays.length) {
        const date = filteredDays[dayIndex];`;

const replaceStr = `    let liveDayIndex = 0;
    
    for (const item of curriculumManagerList) {
      let foundDay = false;
      const phase = item.phase;
      
      while (liveDayIndex < allDays.length) {
        const date = allDays[liveDayIndex];`;

content = content.replace(targetStr, replaceStr);

const targetStr2 = `          dayIndex++; // Consume one slot for this live session
          break;
        } else {
          dayIndex++;
        }
      }
      if (!foundDay) break;
    }`;

const replaceStr2 = `          liveDayIndex++; // Consume one slot for this live session
          break;
        } else {
          liveDayIndex++;
        }
      }
      if (!foundDay) break;
    }`;

content = content.replace(targetStr2, replaceStr2);
fs.writeFileSync('src/App.tsx', content);
console.log('done');
