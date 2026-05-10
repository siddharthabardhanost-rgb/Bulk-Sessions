import * as fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace too transparent background in the date picker popover
code = code.replace(
  /className="absolute top-full left-0 mt-2 w-72 bg-white\/5 border border-brand-border backdrop-blur-md rounded-2xl shadow-xl z-\[100\] p-4 overflow-hidden"/g,
  'className="absolute top-full left-0 mt-2 w-72 bg-[#09090b]/95 border border-brand-border backdrop-blur-xl rounded-2xl shadow-2xl z-[100] p-4 overflow-hidden"'
);

// SearchableInput popover
code = code.replace(
  /className="absolute z-50 w-full mt-2 bg-white\/5 border border-brand-border backdrop-blur-md rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar p-1"/g,
  'className="absolute z-50 w-full mt-2 bg-[#09090b]/95 border border-brand-border backdrop-blur-xl rounded-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar p-1"'
);

// Hour popover
code = code.replace(
  /className="absolute top-full left-1\/2 -translate-x-1\/2 mt-2 w-32 bg-white\/5 border border-brand-border backdrop-blur-md rounded-xl shadow-xl z-\[100\] p-2 grid grid-cols-3 gap-1"/g,
  'className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-[#09090b]/95 border border-brand-border backdrop-blur-xl rounded-xl shadow-2xl z-[100] p-2 grid grid-cols-3 gap-1"'
);

// Minute popover
code = code.replace(
  /className="absolute top-full left-1\/2 -translate-x-1\/2 mt-2 w-48 bg-white\/5 border border-brand-border backdrop-blur-md rounded-xl shadow-xl z-\[100\] p-2 grid grid-cols-5 gap-1 max-h-\[240px\] overflow-y-auto custom-scrollbar"/g,
  'className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#09090b]/95 border border-brand-border backdrop-blur-xl rounded-xl shadow-2xl z-[100] p-2 grid grid-cols-5 gap-1 max-h-[240px] overflow-y-auto custom-scrollbar"'
);


fs.writeFileSync('src/App.tsx', code);
