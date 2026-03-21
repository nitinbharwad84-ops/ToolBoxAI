import { createRequire } from 'module';

export async function extractTextFromPDF(buffer: Buffer | Uint8Array): Promise<string> {
  // Use createRequire to safely bypass Next.js build-time analysis of pdf-parse-fork.
  // This resolves worker crashes by isolating the legacy library from the bundler.
  try {
    const nodeRequire = createRequire(import.meta.url);
    const pdf = nodeRequire('pdf-parse-fork');
    const data = await pdf(Buffer.from(buffer));
    return data.text || '';
  } catch (err) {
    console.error('[pdf-parser] Runtime Error:', err);
    throw new Error('Failed to extract text from PDF. Please upload a smaller or simpler file.');
  }
}
