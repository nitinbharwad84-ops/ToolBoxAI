# UI/UX Refinement: Light SaaS Theme Redesign

## Objective
The user requested fixing the UI/UX by changing the color and theme to a modern, light-colored SaaS application style. The current theme is heavily dark-mode focused (`surface-900` background).

## Proposed Changes

### 1. Global Color Palette Update (`app/globals.css`)
We will invert the `surface` color scale to be light-themed and introduce a fresh, premium primary color suitable for SaaS.

*   **Backgrounds:** `surface-50` (near white) for the main body, `white` for cards.
*   **Text:** `surface-900` for primary text, `surface-500` for secondary text.
*   **Primary Color:** A modern indigo/blue gradient (e.g., `oklch(0.55 0.25 260)`).
*   **Borders:** Subtle gray borders (`surface-200`) to separate sections cleanly.

### 2. UI Component Refinements
The current UI relies heavily on deep glassmorphism (`glass-card` with heavy blur on dark backgrounds). We will adjust this for a light theme:

*   **Cards (`.glass-card`, `.glass`):** Change to solid white or very light gray with subtle, elegant drop shadows (e.g., `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05)`). Remove heavy backdrop blurs which look muddy on light themes.
*   **Header/Sidebar:** Ensure these have distinct but light backgrounds (e.g., `surface-100`) to separate them from the main working area.
*   **Inputs/Textareas:** Update borders to be solid light gray, focusing with a clear primary ring.

### 3. Agent Execution Plan (Phase 2)
Once approved, we will invoke the following agents in parallel:
*   **`frontend-specialist`**: Will rewrite `app/globals.css`, update utility classes like `.glass-card`, and refine specific components (like buttons, modals, and dropzones) to fit the new light theme.
*   **`test-engineer`**: Will run UX validation scripts (`ux_audit.py`) and ensure no contrast or accessibility issues are introduced.

## Verification
*   We will run `ux_audit.py` to verify the new color scheme.
*   We will build the project to ensure no layout breakages.

---
**Do you approve this plan? (Y/N)**
