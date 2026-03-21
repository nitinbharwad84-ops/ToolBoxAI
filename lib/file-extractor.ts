import { extractTextFromPDF } from './pdf-parser';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<string> {
  const extension = fileName.split('.').pop()?.toLowerCase();

  // 1. PDF Support
  if (fileType === 'application/pdf' || extension === 'pdf') {
    return await extractTextFromPDF(buffer);
  }

  // 2. Word (DOCX) Support
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // 3. Plain Text / Markdown / JSON Support
  const textExtensions = ['txt', 'md', 'json', 'csv'];
  if (fileType.startsWith('text/') || textExtensions.includes(extension || '')) {
    return buffer.toString('utf-8');
  }

  // 4. Spreadsheet (XLSX, XLS, CSV) Support
  if (fileType.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let fullText = '';
    
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      // Convert sheet to text (tab-separated or similar)
      const sheetText = XLSX.utils.sheet_to_txt(worksheet);
      if (sheetText.trim()) {
        fullText += `--- Sheet: ${sheetName} ---\n${sheetText}\n\n`;
      }
    });

    return fullText.trim() || 'No text found in spreadsheet.';
  }

  throw new Error('Unsupported file format.');
}
