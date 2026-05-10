import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Colors & Backgrounds
code = code.replace(/bg-\[#F8FAFC\]/g, 'bg-brand-bg relative overflow-hidden');
code = code.replace(/text-slate-900/g, 'text-white');
code = code.replace(/text-slate-800/g, 'text-slate-100');
code = code.replace(/text-slate-700/g, 'text-slate-200');
code = code.replace(/text-slate-600/g, 'text-slate-300');
code = code.replace(/text-slate-500/g, 'text-slate-400');
code = code.replace(/text-slate-400/g, 'text-slate-400'); // remains same
code = code.replace(/text-slate-300/g, 'text-slate-500');

// Replace standard bg-white cards with glass-card
code = code.replace(/bg-white rounded-\[2\.5rem\] p-8 shadow-sm border border-slate-100/g, 'glass-card p-8 border border-white/10');
code = code.replace(/bg-white rounded-3xl p-8 shadow-soft border border-slate-100/g, 'glass-card p-8 border border-white/10');

// Replace inputs / smaller items
code = code.replace(/bg-white border border-slate-200/g, 'bg-white/5 border border-brand-border backdrop-blur-md');
code = code.replace(/bg-white border border-slate-100/g, 'bg-white/5 border border-brand-border backdrop-blur-md');

// Leftover bg-white
code = code.replace(/bg-white/g, 'bg-white/5 backdrop-blur-md border-[1px] border-white/10');

// Slate backgrounds
code = code.replace(/bg-slate-50\/50/g, 'bg-white/[0.03]');
code = code.replace(/bg-slate-50/g, 'bg-white/[0.05]');
code = code.replace(/bg-slate-100\/50/g, 'bg-white/[0.08]');
code = code.replace(/bg-slate-100/g, 'bg-white/[0.1]');
code = code.replace(/bg-slate-200/g, 'bg-white/20');
code = code.replace(/bg-slate-900/g, 'bg-brand-accent-violet text-white');

// Borders
code = code.replace(/border-slate-100/g, 'border-brand-border');
code = code.replace(/border-slate-200/g, 'border-brand-border');
code = code.replace(/border-indigo-100\/50/g, 'border-brand-accent-teal/20');
code = code.replace(/border-indigo-200\/50/g, 'border-brand-accent-teal/30');
code = code.replace(/border-indigo-200/g, 'border-brand-accent-teal/40');
code = code.replace(/border-indigo-500\/50/g, 'border-brand-accent-violet/50');

// Indigo / Accents
code = code.replace(/text-indigo-600/g, 'text-brand-accent-teal');
code = code.replace(/text-indigo-500/g, 'text-brand-accent-violet');
code = code.replace(/text-indigo-400/g, 'text-brand-accent-teal');
code = code.replace(/bg-indigo-50\/30/g, 'bg-brand-accent-teal/10');
code = code.replace(/bg-indigo-50/g, 'bg-brand-accent-violet/10');
code = code.replace(/bg-indigo-600/g, 'bg-gradient-to-r from-brand-accent-violet to-brand-accent-teal border-none shadow-glow text-white');
code = code.replace(/bg-indigo-500/g, 'bg-brand-accent-violet');
code = code.replace(/shadow-indigo-soft/g, 'shadow-glow');
code = code.replace(/ring-indigo-500\/5/g, 'ring-brand-accent-violet/20');
code = code.replace(/ring-indigo-500\/20/g, 'ring-brand-accent-violet/40');

// Fix buttons hover states to look 'liquid' 
code = code.replace(/hover:-translate-y-0\.5/g, 'hover:-translate-y-1 hover:shadow-glow-hover');

// Fix text-white vs text-brand-primary where it may conflict
code = code.replace(/text-brand-primary/g, 'text-white');

fs.writeFileSync('src/App.tsx', code);
