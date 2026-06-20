import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'src');

const walk = (dir, acc = []) => {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory() && f !== 'node_modules') walk(p, acc);
    else if (/\.(js|jsx|css)$/.test(f)) acc.push(p);
  }
  return acc;
};

const replacements = [
  [/https:\/\/images\.unsplash\.com\/photo-1589924691995[^'")\s]*/g, '/images/iot/bowl-kibble.jpg'],
  [/https:\/\/images\.unsplash\.com\/photo-1574158622682[^'")\s]*/g, '/images/placeholders/product-cat.svg'],
  [/https:\/\/images\.unsplash\.com\/photo-1605568427561[^'")\s]*/g, '/images/placeholders/product-toy.svg'],
  [/https:\/\/images\.unsplash\.com\/photo-1601758228041[^'")\s]*/g, '/images/placeholders/product-clothing.svg'],
  [/https:\/\/images\.unsplash\.com\/photo-1587300003388[^'")\s]*/g, '/images/placeholders/product-dog.svg'],
  [/https:\/\/images\.unsplash\.com\/photo-1516734212186[^'")\s]*/g, '/images/iot/complements.jpg'],
  [/https:\/\/via\.placeholder\.com[^'")\s]*/g, '/images/placeholders/product-default.svg'],
  [/https:\/\/images\.unsplash\.com[^'")\s]*/g, '/images/placeholders/product-default.svg'],
];

let count = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [re, rep] of replacements) content = content.replace(re, rep);
  if (content !== original) {
    fs.writeFileSync(file, content);
    count += 1;
    console.log('updated', path.relative(process.cwd(), file));
  }
}
console.log(`Done — ${count} file(s).`);
