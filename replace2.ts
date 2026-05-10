import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Emerald / Rose / Accents
code = code.replace(/bg-emerald-50 /g, 'bg-emerald-500/10 ');
code = code.replace(/text-emerald-600/g, 'text-emerald-400');
code = code.replace(/border-emerald-100/g, 'border-emerald-500/20');
code = code.replace(/border-emerald-200/g, 'border-emerald-500/30');

code = code.replace(/bg-rose-50 /g, 'bg-rose-500/10 ');
code = code.replace(/bg-rose-50/g, 'bg-rose-500/10');
code = code.replace(/bg-rose-100/g, 'bg-rose-500/20');
code = code.replace(/text-rose-700/g, 'text-rose-400');
code = code.replace(/text-rose-600/g, 'text-rose-400');
code = code.replace(/text-rose-500/g, 'text-rose-400');
code = code.replace(/border-rose-200/g, 'border-rose-500/30');

// "glass" instead of "bg-white/5 backdrop-blur-md border-[1px] border-white/10" where it's too much
code = code.replace(/bg-white\/5 backdrop-blur-md border-\[1px\] border-white\/10/g, 'bg-white/5');

// text-slate-400 is fine, hover:bg-slate-50 -> hover:bg-white/5
code = code.replace(/hover:bg-slate-50\b/g, 'hover:bg-white/10');
code = code.replace(/hover:bg-slate-100\b/g, 'hover:bg-white/20');

// Fix text-slate-300 / text-slate-400
// some focus rings
code = code.replace(/focus-within:ring-4/g, ''); // maybe it's too thick, just remove the ring-4 thickness, or let's keep it

// glass card fix for inner tables/grids
code = code.replace(/border-slate-50\b/g, 'border-white/5');

fs.writeFileSync('src/App.tsx', code);
