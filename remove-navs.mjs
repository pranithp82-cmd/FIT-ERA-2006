import fs from 'fs';
import path from 'path';

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else if (filePath.endsWith('page.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles('src/app');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove desktop side navs
  content = content.replace(/<div className="hidden md:flex fixed left-0[\s\S]*?<\/div>\s*$/g, '');
  content = content.replace(/<aside className="hidden md:flex flex-col fixed left-0[\s\S]*?<\/aside>\s*$/g, '');
  
  // Remove mobile bottom navs
  content = content.replace(/<nav className=".*fixed bottom-0[\s\S]*?<\/nav>\s*$/g, '');
  content = content.replace(/<nav className="md:hidden .*fixed bottom-0[\s\S]*?<\/nav>\s*$/g, '');
  
  // Also remove old TopAppBar if exists (since it's in layout now or we can leave it if we want per-page headers)
  // Let's leave headers for now as some have custom titles.
  
  fs.writeFileSync(file, content);
}

console.log('Removed duplicate navs');
