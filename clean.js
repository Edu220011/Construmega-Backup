const fs = require('fs');
const content = fs.readFileSync('backend/index.js', 'utf8');
const lines = content.split('\n');
const cleanLines = lines.filter(line => !line.trim().startsWith('<<<<<<<') && !line.trim().startsWith('=======') && !line.trim().startsWith('>>>>>>>'));
fs.writeFileSync('backend/index.js', cleanLines.join('\n'));
console.log('Conflitos removidos');