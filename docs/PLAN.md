# Phase 29: Fix Email Pacifier & History Formatting

## The Problems

1. **Email Pacifier UI is Blank**: The AI is currently generating JSON with keys like `version_1` and `version_2`, but the frontend UI (`EmailPacifierResult.tsx`) is explicitly looking for `rewritten_email`, `analysis`, and an `alternatives` array. Because the keys don't match, the UI renders empty.
2. **History is Raw JSON**: The History page doesn't use the beautiful result components. When you expand a history item, it just dumps raw `JSON.stringify` text onto the screen, which is ugly and hard to read.

## The Solution (Phase 2)
If approved, the agents will execute the following parallel fixes:

### 1. `backend-specialist`
*   Update `lib/prompt-builder.ts` (Email Pacifier Prompt).
*   Change the JSON schema injected into the AI to strictly output:
    ```json
    {
      "subject_line": "...",
      "analysis": "...",
      "rewritten_email": "...",
      "alternatives": ["...", "..."]
    }
    ```
    This instantly fixes the Email Pacifier result box.

### 2. `frontend-specialist`
*   Update `app/dashboard/history/page.tsx`.
*   Import the 3 Result Components (`SummarizerResult`, `ResumeRoasterResult`, `EmailPacifierResult`).
*   Instead of `<pre>{JSON.stringify()}</pre>`, inject the correct component based on `item.tool_name` (e.g., `summarizer`, `resume_roaster`, `email_pacifier`).
*   The history page will now look exactly like the tool pages, fully formatted and beautiful.

---
**Do you approve this plan? (Y/N)**
Y