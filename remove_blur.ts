import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/backdrop-blur-md /g, '');
fs.writeFileSync('src/App.tsx', code);
