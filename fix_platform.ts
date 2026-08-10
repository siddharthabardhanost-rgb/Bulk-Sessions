import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace("sessionPlatform: '',", "sessionPlatform: 'ZOOM',");
fs.writeFileSync('src/App.tsx', content);
