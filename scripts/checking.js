#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const csvPath = path.join(projectRoot, 'birds.csv');
const templatePath = path.join(projectRoot, 'birds', 'template.html');
const birdsDir = path.join(projectRoot, 'birds');

function slugifySpeciesName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text.charAt(index);
    const nextCharacter = text.charAt(index + 1);

    if (inQuotes) {
      if (character === '"') {
        if (nextCharacter === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (character === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (character !== '\r') {
      field += character;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() || [];
  return rows
    .filter((values) => values.join('').trim().length > 0)
    .map((values) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header.trim()] = (values[index] || '').trim();
      });
      return record;
    });
}

function getImageReferencesFromBirdPages() {
  const imageNames = new Set();
  const imagePattern = /src=["']\.\.\/images\/([^"']+)["']/g;

  fs.readdirSync(birdsDir)
    .filter((fileName) => fileName.endsWith('.html') && fileName !== 'template.html')
    .forEach((fileName) => {
      const filePath = path.join(birdsDir, fileName);
      const content = fs.readFileSync(filePath, 'utf8');
      let match;

      while ((match = imagePattern.exec(content)) !== null) {
        imageNames.add(match[1]);
      }
    });

  return Array.from(imageNames).sort();
}

function getExistingImageNames() {
  return new Set(
    fs.readdirSync(path.join(projectRoot, 'images'))
      .filter((fileName) => fileName !== '.DS_Store')
  );
}

function printMissingImages() {
  const referencedImages = getImageReferencesFromBirdPages();
  const existingImages = getExistingImageNames();
  const missingImages = referencedImages.filter((fileName) => !existingImages.has(fileName));

  if (!missingImages.length) {
    console.log('No missing bird images found.');
    return;
  }

  console.log('Missing bird images mentioned in current bird pages:');
  missingImages.forEach((fileName) => console.log(`- ${fileName}`));
}

function fillTemplate(template, bird) {
  const title = bird.species;
  const scientificName = bird.scientific_name || 'Scientific';
  const otherNames = bird.other_name ? `Other names: ${bird.other_name}` : 'Other names:';

  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<h1>[^<]*<\/h1>/, `<h1>${title}</h1>`)
    .replace(/<h2 class="latin">[^<]*<\/h2>/, `<h2 class="latin">${scientificName}</h2>`)
    .replace(/<p class="other-names">[^<]*<\/p>/, `<p class="other-names">${otherNames}</p>`);
}

function main() {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const template = fs.readFileSync(templatePath, 'utf8');
  const birds = parseCsv(csvText);
  printMissingImages();

  const existingPages = new Set(
    fs.readdirSync(birdsDir)
      .filter((fileName) => fileName.endsWith('.html') && fileName !== 'template.html')
  );

  const createdFiles = [];

  birds.forEach((bird) => {
    if (!bird.species) return;

    const fileName = `${slugifySpeciesName(bird.species)}.html`;
    if (existingPages.has(fileName)) return;

    const outputPath = path.join(birdsDir, fileName);
    const output = fillTemplate(template, bird);
    fs.writeFileSync(outputPath, output, 'utf8');
    createdFiles.push(fileName);
  });

  if (!createdFiles.length) {
    console.log('No missing bird pages found.');
    return;
  }

  console.log(`Created ${createdFiles.length} bird page${createdFiles.length === 1 ? '' : 's'}:`);
  createdFiles.forEach((fileName) => console.log(`- birds/${fileName}`));
}

main();