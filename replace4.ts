import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/placeholder:text-slate-200/g, 'placeholder:text-slate-500');
code = code.replace(/placeholder:text-slate-300/g, 'placeholder:text-slate-500');
code = code.replace(/placeholder:text-slate-400/g, 'placeholder:text-slate-500');
fs.writeFileSync('src/App.tsx', code);
