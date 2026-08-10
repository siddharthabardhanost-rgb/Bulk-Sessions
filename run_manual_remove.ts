import * as fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const regex1 = /                          \) \: slot\.category \=\=\= \'live\-sessions\-aig\' \? \(\n\s*\<\>\n[\s\S]*?\<\/\>\n\s*\) \: \(/;
app = app.replace(regex1, "                          ) : (");

const regex2 = /                              \{slot\.category \=\=\= \'live\-sessions\-aig\' \? \(\n\s*\/\* Standard LIVE Instructors \*\/[\s\S]*?\) \: \(/;
app = app.replace(regex2, "                              {(");

fs.writeFileSync('src/App.tsx', app);
