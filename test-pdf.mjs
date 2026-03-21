import { PDFDocument } from 'pdf-lib';
import { PDFParse } from 'pdf-parse';

async function test() {
  console.log('Generating PDF...');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText('Hello World');
  const buffer = await pdfDoc.save();

  console.log('Parsing PDF...');
  try {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    console.log('Parsed lines:', parsed.text);
  } catch (err) {
    console.error('Crash in pdfParse:', err);
  }
}

test();
