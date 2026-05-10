import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-white\/5\/5\/5/g, 'bg-white/5');
code = code.replace(/bg-white\/5\/5/g, 'bg-white/5');
code = code.replace(/bg-white\/5\/80/g, 'bg-black/40');
code = code.replace(/bg-rose-500\/100\/10/g, 'bg-rose-500/10');
code = code.replace(/bg-brand-accent-violet\/100/g, 'bg-brand-accent-violet');
code = code.replace(/text-white text-white/g, 'text-white');
code = code.replace(/hover:bg-white\/\[0\.05\] hover:text-brand-accent-teal/g, 'hover:bg-brand-accent-teal/10 hover:text-brand-accent-teal');

fs.writeFileSync('src/App.tsx', code);
