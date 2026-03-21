declare module 'pdf-parse-fork' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    text: string;
    version: string;
  }

  function pdf(dataBuffer: Buffer | Uint8Array, options?: Record<string, unknown>): Promise<PDFData>;
  export = pdf;
}
