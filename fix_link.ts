import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  `        } else {
          // Sunday (0) uses sundayLink, others use saturdayLink
          sessionLink = dayOfWeek === 0 ? slot.sundayLink : slot.saturdayLink;
        }`,
  `        } else if (dayOption === 'weekends') {
          // Sunday (0) uses sundayLink, others use saturdayLink
          sessionLink = dayOfWeek === 0 ? slot.sundayLink : slot.saturdayLink;
        } else {
          sessionLink = slot.sessionLink;
        }`
);
fs.writeFileSync('src/App.tsx', content);
