import path from 'path';
import fs from 'fs-extra';
import { extractText } from './extract-text.js';
import { extractImages } from './extract-images.js';
import { mapProjects } from './map-projects.js';

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node index.js <path-to-pdf>');
        process.exit(1);
    }

    const pdfPath = path.resolve(args[0]);
    if (!fs.existsSync(pdfPath)) {
        console.error(`Error: File not found: ${pdfPath}`);
        process.exit(1);
    }

    console.log(`Processing: ${pdfPath}`);

    // 1. Extract Text
    console.log('Extracting text...');
    const pages = await extractText(pdfPath);
    // console.log('Extracted pages:', JSON.stringify(pages, null, 2));

    // 2. Extract Images (to temp)
    const tempImgDir = path.resolve('assets/temp');
    console.log('Extracting images...');
    await fs.ensureDir(tempImgDir);
    const rawImages = await extractImages(pdfPath, tempImgDir);
    console.log(`Extracted ${rawImages.length} images.`);

    // 3. Map Projects
    console.log('Mapping projects...');
    const projects = mapProjects(pages, rawImages);
    console.log(`Identified ${projects.length} projects.`);

    // 4. Organize Assets and Normalize
    const finalProjects = [];
    const assetsBaseDir = path.resolve('assets');

    for (const proj of projects) {
        const projSlug = proj.id;
        const projDir = path.join(assetsBaseDir, projSlug);
        await fs.ensureDir(projDir);

        const relativeImages = [];

        for (const imgPath of proj.images) {
            // Move file
            const fileName = path.basename(imgPath);
            const destPath = path.join(projDir, fileName);

            // We copy instead of move in case image is used in multiple projects (unlikely but safe)
            // Or move if we want to clean up.
            // Let's copy.
            await fs.copy(imgPath, destPath);

            // Store relative path for JSON
            relativeImages.push(`assets/${projSlug}/${fileName}`);
        }

        finalProjects.push({
            ...proj,
            images: relativeImages
        });
    }

    // 5. Write Output
    const outputDir = path.resolve('output');
    await fs.ensureDir(outputDir);
    const outputPath = path.join(outputDir, 'works.json');

    await fs.writeJson(outputPath, finalProjects, { spaces: 2 });
    console.log(`Success! Output written to ${outputPath}`);

    // Cleanup temp
    await fs.remove(tempImgDir);
}

main().catch(err => {
    console.error('An error occurred:', err);
    process.exit(1);
});
