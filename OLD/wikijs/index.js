// convert.js
//
// Recursively scans current folder for .md files
// Converts Docusaurus admonitions to Wiki.js format
// Outputs alongside original as:
//   file.md -> file.wikijs.md
//
// Usage:
//   node convert.js
//   node convert.js ./docs

const fs = require('fs');
const path = require('path');

const rootDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : process.cwd();

const typeMap = {
  info: 'is-info',
  tip: 'is-success',
  warning: 'is-warning',
  danger: 'is-danger',
  note: 'is-info',
};

const admonitionRegex =
  /:::([a-zA-Z]+)(?:\s+([^\n]+))?\n([\s\S]*?)\n:::/g;

function convertAdmonitions(text) {
  return text.replace(
    admonitionRegex,
    (_, type, title, body) => {
      const wikiClass =
        typeMap[type.toLowerCase()] || 'is-info';

      const lines = body
        .trim()
        .split('\n')
        .map(line => {
          if (line.trim() === '') {
            return '>';
          }
          return `> ${line}`;
        });

      let result = '';

      if (title) {
        result += `> **${title.trim()}**\n`;
      } else {
        result += `> **${capitalize(type)}**\n`;
      }

      result += lines.join('\n');
      result += `\n{.${wikiClass}}`;

      return result;
    }
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith('.md') &&
      !entry.name.endsWith('.wikijs.md')
    ) {
      convertFile(fullPath);
    }
  }
}

function convertFile(filePath) {
  console.log(`Converting: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf8');

  const converted = convertAdmonitions(content);

  const outputPath = filePath.replace(
    /\.md$/,
    '.wikijs.md'
  );

  fs.writeFileSync(outputPath, converted, 'utf8');

  console.log(` -> ${outputPath}`);
}

console.log(`Scanning: ${rootDir}`);
walk(rootDir);
console.log('Done.');