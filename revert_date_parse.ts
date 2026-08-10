import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const strToReplace = `  // Session Count Logic
  const sessionCount = (() => {
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());

    if (!isValid(start) || !isValid(end) || start > end) return 0;

    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());
    if (!isValid(start) || !isValid(end) || start > end) {
      alert('Invalid date range.');
      setIsGenerating(false);
      return;
    }
    const allDays = eachDayOfInterval({ start, end });`;

const replaceWith = `  // Session Count Logic
  const sessionCount = (() => {
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());

    if (!isValid(start) || !isValid(end) || start > end) return 0;

    const allDays = eachDayOfInterval({ start, end });`;

content = content.replace(strToReplace, replaceWith);

const genFuncToReplace = `    const allUsedCourses = timeSlots.flatMap(s => s.course);
    saveToRecentCourses(allUsedCourses);

    const allDays = eachDayOfInterval({ start, end });`;
    
const genFuncReplaceWith = `    const allUsedCourses = timeSlots.flatMap(s => s.course);
    saveToRecentCourses(allUsedCourses);

    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());
    if (!isValid(start) || !isValid(end) || start > end) {
      alert('Invalid date range.');
      setIsGenerating(false);
      return;
    }
    const allDays = eachDayOfInterval({ start, end });`;

content = content.replace(genFuncToReplace, genFuncReplaceWith);

fs.writeFileSync('src/App.tsx', content);
