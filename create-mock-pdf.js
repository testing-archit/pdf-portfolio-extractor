import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs-extra';
import path from 'path';

async function createMockPdf() {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Tiny 1x1 red pixel JPEG base64
    const jpgBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9A6KKKAP/2Q==';

    // Clean base64 for pdf-lib (remove data url prefix)
    const jpgData = jpgBase64.split(',')[1];
    const jpgImage = await pdfDoc.embedJpg(jpgData);

    // Page 1: Introduction (No project)
    const page1 = pdfDoc.addPage();
    page1.drawText('PORTFOLIO 2024', { x: 50, y: 700, size: 30, font });
    page1.drawText('John Doe - Designer', { x: 50, y: 650, size: 20, font });

    // Page 2: Project 1 Title
    const page2 = pdfDoc.addPage();
    page2.drawText('SMART CHEF', { x: 50, y: 750, size: 40, font }); // CAPS, Large
    page2.drawText('App Design / UI UX', { x: 50, y: 700, size: 15, font });
    page2.drawImage(jpgImage, { x: 50, y: 400, width: 200, height: 200 });

    // Page 3: Project 1 Content
    const page3 = pdfDoc.addPage();
    page3.drawText('More screens for Smart Chef', { x: 50, y: 750, size: 12, font });
    page3.drawImage(jpgImage, { x: 300, y: 400, width: 200, height: 200 });

    // Page 4: Project 2 Title
    const page4 = pdfDoc.addPage();
    page4.drawText('FOREST BRANDING', { x: 50, y: 750, size: 35, font });
    page4.drawText('Corporate Identity', { x: 50, y: 700, size: 15, font });
    page4.drawImage(jpgImage, { x: 50, y: 100, width: 400, height: 300 });

    const pdfBytes = await pdfDoc.save();
    await fs.ensureDir('input');
    await fs.writeFile('input/mock.pdf', pdfBytes);
    console.log('Created input/mock.pdf');
}

createMockPdf().catch(console.error);
