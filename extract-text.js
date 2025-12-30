import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extracts text from a PDF file with metadata for heuristics.
 * @param {string} pdfPath - Path to the PDF file.
 * @returns {Promise<Array<{ page: number, content: Array<{ str: string, height: number, isCaps: boolean }> }>>}
 */
export async function extractText(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pages = [];

    const options = {
        pagerender: async function (pageData) {
            const textContent = await pageData.getTextContent();

            const lines = [];
            let currentLine = { str: '', height: 0, items: 0 };
            let lastY = null;

            // Simple line grouping based on Y coordinate
            // Note: items are usually sorted by PDF order, which is often reading order but not always.
            // We assume standard top-down.

            for (let item of textContent.items) {
                const y = item.transform[5]; // transform[5] is usually the y translation
                const height = item.height || 0; // approximate font size

                if (lastY !== null && Math.abs(y - lastY) > 5) {
                    // New line detected (threshold of 5 units)
                    if (currentLine.str.trim()) {
                        lines.push({
                            str: currentLine.str.trim(),
                            height: currentLine.height / (currentLine.items || 1), // avg height
                            isCaps: currentLine.str === currentLine.str.toUpperCase() && currentLine.str.trim().length > 1
                        });
                    }
                    currentLine = { str: '', height: 0, items: 0 };
                }

                currentLine.str += item.str; // pdf-parse items might have spaces?
                currentLine.height += height;
                currentLine.items++;
                lastY = y;
            }

            // Push last line
            if (currentLine.str.trim()) {
                lines.push({
                    str: currentLine.str.trim(),
                    height: currentLine.height / (currentLine.items || 1),
                    isCaps: currentLine.str === currentLine.str.toUpperCase() && currentLine.str.trim().length > 1
                });
            }

            pages.push({
                page: pageData.pageIndex + 1,
                lines: lines
            });

            return ""; // We don't need the concatenated string return from pdf-parse
        }
    };

    await pdf(dataBuffer, options);
    pages.sort((a, b) => a.page - b.page);
    return pages;
}
