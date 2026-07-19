import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// For custom day config
content = content.replace(
  `{(['live-sessions-aig', 'qna-sessions-aig', 'qna-sessions-bsiai'] as const).map((c) => (`,
  `{(['live-sessions-aig', 'qna-sessions-aig', 'qna-sessions-bsiai', ...customLiveCategories.map(c => c.slug)] as string[]).map((c) => (`
);

content = content.replace(
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : 'LIVE'}`,
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c === 'live-sessions-aig' ? 'LIVE' : customLiveCategories.find(cat => cat.slug === c)?.label || c}`
);

// For standard time slot config
content = content.replace(
  `{(['qna-sessions-aig', 'qna-sessions-bsiai', 'live-sessions-aig'] as const).map((c) => (`,
  `{(['qna-sessions-aig', 'qna-sessions-bsiai', 'live-sessions-aig', ...customLiveCategories.map(c => c.slug)] as string[]).map((c) => (`
);

content = content.replace(
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : 'LIVE'}`,
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c === 'live-sessions-aig' ? 'LIVE' : customLiveCategories.find(cat => cat.slug === c)?.label || c}`
);

fs.writeFileSync('src/App.tsx', content);
