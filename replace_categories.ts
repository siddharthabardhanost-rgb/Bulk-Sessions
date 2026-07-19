import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  `{(['live-sessions-aig', 'qna-sessions-aig'] as const).map((c) => (`,
  `{(['live-sessions-aig', 'qna-sessions-aig', 'qna-sessions-bsiai'] as const).map((c) => (`
);

content = content.replace(
  `{(['qna-sessions-aig', 'live-sessions-aig'] as const).map((c) => (`,
  `{(['qna-sessions-aig', 'qna-sessions-bsiai', 'live-sessions-aig'] as const).map((c) => (`
);

content = content.replace(
  `{c === 'qna-sessions-aig' ? 'Q&A' : 'LIVE'}`,
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : 'LIVE'}`
);

content = content.replace(
  `{c === 'qna-sessions-aig' ? 'Q&A' : 'LIVE'}`,
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : 'LIVE'}`
);

fs.writeFileSync('src/App.tsx', content);
