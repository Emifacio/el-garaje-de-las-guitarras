const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.astro') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let count = 0;
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('text-slate-500')) {
        fs.writeFileSync(file, content.replace(/text-slate-500/g, 'text-slate-400'), 'utf8');
        count++;
        console.log('Updated ' + file);
    }
});
console.log('Total files updated: ' + count);
