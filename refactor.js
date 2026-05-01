/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
      filelist.push(filepath);
    }
  }
  return filelist;
};

const files = walkSync('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Generic Button replacements
  content = content.replace(/className="[^"]*bg-brand[^"]*text-white[^"]*hover:bg-accent[^"]*"/g, 'className="btn-brand"');
  content = content.replace(/className="[^"]*bg-surface[^"]*border-border[^"]*text-primary[^"]*hover:bg-white\/5[^"]*"/g, 'className="btn-ghost"');

  // Generic Card replacements
  content = content.replace(/className="[^"]*bg-surface\/50[^"]*border-border[^"]*rounded-3xl[^"]*"/g, 'className="card"');
  content = content.replace(/className="[^"]*bg-elevated[^"]*border-border[^"]*rounded-xl[^"]*"/g, 'className="card"');
  content = content.replace(/className="[^"]*bg-surface[^"]*border-border[^"]*rounded-xl[^"]*"/g, 'className="card"');

  // Form Inputs
  content = content.replace(/className="[^"]*bg-\[rgba\(255,255,255,0\.02\)\][^"]*border-input[^"]*"/g, 'className="form-input"');
  content = content.replace(/className="[^"]*bg-surface[^"]*border-input[^"]*"/g, 'className="form-input"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
