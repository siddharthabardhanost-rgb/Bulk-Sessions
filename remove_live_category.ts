import * as fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(
  `(['live-sessions-aig', 'qna-sessions-aig', 'qna-sessions-bsiai', ...customLiveCategories.map(c => c.slug)] as string[])`,
  `(['qna-sessions-aig', 'qna-sessions-bsiai'] as string[])`
);

app = app.replace(
  `(['qna-sessions-aig', 'qna-sessions-bsiai', 'live-sessions-aig', ...customLiveCategories.map(c => c.slug)] as string[])`,
  `(['qna-sessions-aig', 'qna-sessions-bsiai'] as string[])`
);

// We should also replace the label rendering
app = app.replace(
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c === 'live-sessions-aig' ? 'LIVE' : customLiveCategories.find(cat => cat.slug === c)?.label || c}`,
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c}`
);
app = app.replace(
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c === 'live-sessions-aig' ? 'LIVE' : customLiveCategories.find(cat => cat.slug === c)?.label || c}`,
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c}`
);


// Change default category in addTimeSlot
app = app.replace(`category: config?.category || 'live-sessions-aig',`, `category: config?.category || 'qna-sessions-aig',`);
app = app.replace(`category: 'live-sessions-aig',`, `category: 'qna-sessions-aig',`);

// Update label in UI from "Time Slots Configuration" to "Q&A Time Slots Configuration"
app = app.replace(`Time Slots Configuration`, `Q&A Time Slots Configuration`);

fs.writeFileSync('src/App.tsx', app);
