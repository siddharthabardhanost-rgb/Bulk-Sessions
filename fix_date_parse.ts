import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const strToReplace = `    const allDays = eachDayOfInterval({ start, end });`;
const replaceWith = `    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());
    if (!isValid(start) || !isValid(end) || start > end) {
      alert('Invalid date range.');
      setIsGenerating(false);
      return;
    }
    const allDays = eachDayOfInterval({ start, end });`;

content = content.replace(strToReplace, replaceWith);
fs.writeFileSync('src/App.tsx', content);
