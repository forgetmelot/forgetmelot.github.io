#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const csvPath = path.join(projectRoot, 'birds.csv');
const templatePath = path.join(projectRoot, 'birds', 'template.html');
const birdsDir = path.join(projectRoot, 'birds');
const siteScriptPath = path.join(projectRoot, 'js', 'script.js');

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

function getFamilySubtexts() {
  const content = fs.readFileSync(siteScriptPath, 'utf8');
  const match = content.match(/var FAMILY_SUBTEXTS = \{([\s\S]*?)\n\s*\};/);

  if (!match) {
    return {};
  }

  const familySubtexts = {};
  const body = match[1];

  body.replace(/^\s*([A-Za-z][A-Za-z0-9_]*):/gm, (fullMatch, familyName) => {
    familySubtexts[familyName] = true;
  });

  return familySubtexts;
}

function printMissingFamilyDescriptions(birds) {
  const familySubtexts = getFamilySubtexts();
  const presentFamilies = [...new Set(
    birds
      .filter((bird) => bird.family || bird.Family)
      .map((bird) => getBirdValue(bird, ['family', 'Family']))
      .filter(Boolean)
  )].sort();

  const missingFamilyDescriptions = presentFamilies.filter((familyName) => !familySubtexts[familyName]);

  if (!missingFamilyDescriptions.length) {
    console.log('No families missing description names in js/script.js.');
    return;
  }

  console.log('Families missing description names in js/script.js:');
  missingFamilyDescriptions.forEach((familyName) => console.log(`- ${familyName}`));
}

function getBirdValue(bird, keys) {
  for (const key of keys) {
    if (bird[key]) return bird[key];
  }
  return '';
}

function buildTaxonomyLines(order, family, indent = '') {
  const lineIndent = indent || '  ';
  return [
    `${lineIndent}<p class="taxonomy">Order: ${order}</p>`,
    `${lineIndent}<p class="taxonomy">Family: ${family}</p>`,
  ].join('\n');
}

function getIndentation(content, pattern) {
  const match = content.match(pattern);
  if (!match) return '';
  return match[1] || '';
}

function ensureTaxonomyLines(content, order, family) {
  const taxonomyPattern = /(?:\n)([ \t]*)<p class="taxonomy">Order:[\s\S]*?\n\1<p class="taxonomy">Family:[\s\S]*?<\/p>/m;

  const anchorIndent = getIndentation(content, /^(\s*)<p class="other-names">/m)
    || getIndentation(content, /^(\s*)<h2 class="latin">/m)
    || '';

  const taxonomyLines = buildTaxonomyLines(order, family, anchorIndent);

  if (taxonomyPattern.test(content)) {
    return content.replace(taxonomyPattern, () => `\n${buildTaxonomyLines(order, family, anchorIndent)}`);
  }

  const insertAfterOtherNames = /(<p class="other-names">[\s\S]*?<\/p>)/m;
  const insertAfterLatin = /(<h2 class="latin">[\s\S]*?<\/h2>)/m;

  if (insertAfterOtherNames.test(content)) {
    return content.replace(insertAfterOtherNames, `$1\n${taxonomyLines}`);
  }

  if (insertAfterLatin.test(content)) {
    return content.replace(insertAfterLatin, `$1\n${taxonomyLines}`);
  }

  return content;
}

function syncTemplateFile() {
  const template = fs.readFileSync(templatePath, 'utf8');
  const updated = ensureTaxonomyLines(template, '{{order}}', '{{family}}');

  if (updated !== template) {
    fs.writeFileSync(templatePath, updated, 'utf8');
    console.log('Updated birds/template.html');
  }
}

function syncExistingBirdPages(birds) {
  const birdBySlug = new Map(
    birds
      .filter((bird) => bird.species)
      .map((bird) => [slugifySpeciesName(bird.species), bird])
  );

  fs.readdirSync(birdsDir)
    .filter((fileName) => fileName.endsWith('.html') && fileName !== 'template.html')
    .forEach((fileName) => {
      const bird = birdBySlug.get(fileName.replace(/\.html$/, ''));
      if (!bird) return;

      const filePath = path.join(birdsDir, fileName);
      const original = fs.readFileSync(filePath, 'utf8');

      const order = getBirdValue(bird, ['order', 'Order']);
      const family = getBirdValue(bird, ['family', 'Family']);
      const updated = ensureTaxonomyLines(original, order, family);

      if (updated !== original) {
        fs.writeFileSync(filePath, updated, 'utf8');
      }
    });
}

function fillTemplate(template, bird) {
  const title = bird.species;
  const scientificName = bird.scientific_name || 'Scientific';
  const otherNames = bird.other_name ? `Other names: ${bird.other_name}` : 'Other names:';
  const order = getBirdValue(bird, ['order', 'Order']);
  const family = getBirdValue(bird, ['family', 'Family']);

  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<h1>[^<]*<\/h1>/, `<h1>${title}</h1>`)
    .replace(/<h2 class="latin">[^<]*<\/h2>/, `<h2 class="latin">${scientificName}</h2>`)
    .replace(/<p class="other-names">[^<]*<\/p>/, `<p class="other-names">${otherNames}</p>`)
    .replace(/{{order}}/g, order)
    .replace(/{{family}}/g, family);
}

function main() {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const birds = parseCsv(csvText);

  printMissingImages();
  printMissingFamilyDescriptions(birds);
  syncTemplateFile();
  syncExistingBirdPages(birds);

  const template = fs.readFileSync(templatePath, 'utf8');

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