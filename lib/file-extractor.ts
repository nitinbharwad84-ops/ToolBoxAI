import { extractTextFromPDF } from './pdf-parser';
import * as mammoth from 'mammoth';

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

  // 4. Fallback or spreadsheet (spreadsheet is handled separately if needed)
  if (fileType.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls') {
    throw new Error('Spreadsheet extraction requires specialized processing (xlsx).');
  }

  throw new Error('Unsupported file format.');
}
