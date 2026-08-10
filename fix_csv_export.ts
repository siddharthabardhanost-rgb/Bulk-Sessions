import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetRowsStr = `    const rows = generatedSchedule.map(item => [
      \`"\${item.title.replace(/"/g, '""')}"\`,
      \`"\${item.description.replace(/"/g, '""')}"\`,
      \`"\${item.sessionLink.replace(/"/g, '""')}"\`,
      \`"\${item.sessionPlatform.replace(/"/g, '""')}"\`,
      \`"\${item.category.replace(/"/g, '""')}"\`,
      \`"\${item.startTime}"\`,
      \`"\${item.endTime}"\`,
      \`"\${item.instructors.replace(/"/g, '""')}"\`,
      \`"\${item.course.replace(/"/g, '""')}"\`,
      \`"\${item.batch.replace(/"/g, '""')}"\`,
      \`"\${item.courseGroup.replace(/"/g, '""')}"\`
    ].join(','));`;

const replaceRowsStr = `    const rows = generatedSchedule.map(item => [
      \`"\${(item.title || '').replace(/"/g, '""')}"\`,
      \`"\${(item.description || '').replace(/"/g, '""')}"\`,
      \`"\${(item.sessionLink || '').replace(/"/g, '""')}"\`,
      \`"\${(item.sessionPlatform || '').replace(/"/g, '""')}"\`,
      \`"\${(item.category || '').replace(/"/g, '""')}"\`,
      \`"\${item.startTime || ''}"\`,
      \`"\${item.endTime || ''}"\`,
      \`"\${(item.instructors || '').replace(/"/g, '""')}"\`,
      \`"\${(item.course || '').replace(/"/g, '""')}"\`,
      \`"\${(item.batch || '').replace(/"/g, '""')}"\`,
      \`"\${(item.courseGroup || '').replace(/"/g, '""')}"\`
    ].join(','));`;

content = content.replace(targetRowsStr, replaceRowsStr);

const targetTsvStr = `    const tsvRows = generatedSchedule.map(item => [
      item.title,
      item.description,
      item.sessionLink,
      item.sessionPlatform,
      item.category,
      item.startTime,
      item.endTime,
      item.instructors,
      item.course,
      item.batch,
      item.courseGroup
    ].join('\t'));`;

const replaceTsvStr = `    const tsvRows = generatedSchedule.map(item => [
      item.title || '',
      item.description || '',
      item.sessionLink || '',
      item.sessionPlatform || '',
      item.category || '',
      item.startTime || '',
      item.endTime || '',
      item.instructors || '',
      item.course || '',
      item.batch || '',
      item.courseGroup || ''
    ].join('\t'));`;

content = content.replace(targetTsvStr, replaceTsvStr);

fs.writeFileSync('src/App.tsx', content);
console.log('done');
