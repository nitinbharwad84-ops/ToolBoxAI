# PDF Extraction Bugfix & Resume Roaster File Upload Plan

## User Review Required
The proposed changes will directly address the "Failed to extract text from PDF" error by safely importing `pdf-parse` and tracking errors. It will also duplicate the `FileDropzone` UI behavior from the Summarizer directly into the Resume Roaster.

## Proposed Changes

### `app/api/tools/summarize/route.ts`
- **[MODIFY]**: 
  - Statically import `pdfParse` from `pdf-parse` instead of using a local dynamic `require()` which fails to bundle the necessary `pdf.js` worker processes inside Next.js.
  - Expose the exact error instance string in the `catch` block so if extraction fails again, we know exactly WHY instead of a silent fallback message.

### `app/api/tools/resume-roast/route.ts`
- **[MODIFY]**:
  - Accept `fileBase64`, `fileName`, and `fileType`. 
  - Implement the exact same `MAX_FILE_SIZE_FREE` checks.
  - Run the `pdfParse(buffer)` parser if the upload is a PDF, assigning the extracted text to the `content` variable.

### `app/dashboard/resume-roaster/page.tsx`
- **[MODIFY]**:
  - Add the File state (`const [file, setFile] = useState<File | null>(null);`).
  - Render the `<FileDropzone />` component gracefully aligned above the textarea.
  - Pass the array buffer to `body.fileBase64` during submission when a file is dropped.

## Verification Plan

### Automated Tests
- `npm run dev` and `npx next build` to guarantee no breakage in `pdf-parse` module resolution.
- Uploading a PDF directly into the UI components to verify successful binary conversions.