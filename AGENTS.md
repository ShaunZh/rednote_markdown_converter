# AGENTS.md

## Purpose

- This file defines repository-specific guidance for coding agents and contributors.
- Follow this document for implementation style, commands, and PR expectations.
- Keep changes pragmatic, small, and aligned with existing patterns.

## Project Snapshot

- Project name: `rednote-markdown-converter`
- Runtime: Node.js
- Framework: Next.js `14.1.0` with App Router
- Language: TypeScript + React 18
- Styling: Tailwind CSS + global CSS
- Main function: Convert Markdown into themed, paginated image cards
- Client-first architecture with lightweight server routes for import/proxy

## Tech Stack (from repo)

- `next`, `react`, `react-dom`
- UI/icons/utilities: `lucide-react`, `clsx`, `tailwind-merge`
- Markdown rendering: `react-markdown`, `remark-gfm`, `react-syntax-highlighter`
- Export pipeline: `html-to-image`, `jszip`, `file-saver`
- Import/parsing: `axios`, `cheerio`, `turndown`
- Tooling: `typescript`, `tailwindcss`, `postcss`, `autoprefixer`

## Repository Structure

- `app/`
- `app/layout.tsx`: root layout and global font link setup
- `app/page.tsx`: home/dashboard with recent drafts
- `app/draft/page.tsx`: main editor, pagination preview, export workflow
- `app/api/parse-wechat/route.ts`: URL fetch + HTML to Markdown conversion
- `app/api/proxy-image/route.ts`: image proxy endpoint for external images
- `components/`
- Editor UI: `EditorHeader.tsx`, `EditorToolbar.tsx`, `ImportModal.tsx`
- Render UI: `MarkdownRenderer.tsx`, `CoverCard.tsx`, `ThemeSidebar.tsx`, `ThemeHeaders.tsx`
- `hooks/`
- `useSmartPagination.ts`: block splitting, DOM measurement, pagination logic
- `lib/`
- `themeConfig.ts`: typed theme schema + presets + CSS variable mapper
- `draftStorage.ts`: localStorage persistence and recent edits model
- `utils.ts`: shared `cn()` className merge helper
- `docs/`
- product/feature requirement notes (currently draft auto-save doc)
- Root configs: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`

## Key Architectural Patterns

- Use App Router pages under `app/` and colocate API routes in `app/api`.
- Keep most state in client components with React hooks.
- Use typed models/interfaces for theme, draft, and component props.
- Route-level composition: page files orchestrate state and child components.
- Prefer reusable presentational components in `components/`.
- Keep side effects explicit in `useEffect` with clear dependency arrays.
- Centralize theming through `lib/themeConfig.ts` and CSS variables.
- Persist user draft data in `localStorage` via `lib/draftStorage.ts`.

## Coding Standards

- Language and typing:
- Use TypeScript for all source changes.
- Prefer explicit interfaces/types for props and domain models.
- Avoid `any`; if unavoidable, keep usage localized and justified.
- Keep exported function and type names descriptive.

- React/component style:
- Use functional components and hooks.
- Keep components focused; split UI blocks instead of creating monoliths.
- Favor controlled state updates and pure render logic.
- Keep event handlers clear and purpose-specific.

- File/style conventions:
- Match existing naming patterns (`PascalCase` for components, `camelCase` for utilities).
- Keep imports grouped: external first, then internal.
- Reuse `cn()` helper from `lib/utils.ts` for class merging.
- Use Tailwind utility classes as primary styling mechanism.
- Add concise comments only where behavior is non-obvious.

- Data and persistence:
- Access `localStorage` through safe wrappers/patterns (SSR guards + try/catch).
- Preserve current storage keys and data compatibility when possible.
- Avoid introducing breaking schema changes without migration logic.

- API routes:
- Validate inputs early and return explicit status codes.
- Keep error messages actionable and avoid leaking unnecessary internals.
- Maintain timeout/error handling for remote fetches.

## What To Avoid

- Do not add new frameworks or tooling without explicit request.
- Do not introduce server-side persistence (DB/auth) unless requested.
- Do not rewrite architecture for small fixes.
- Do not rename storage keys or theme IDs casually.
- Do not commit unrelated refactors with functional changes.

## Local Development Commands

- Install dependencies:
- `npm install`

- Start development server:
- `npm run dev`

- Run lint:
- `npm run lint`

- Build production bundle:
- `npm run build`

- Start production server:
- `npm run start`

## Testing and Validation

- There is currently no `test` script in `package.json`.
- Required validation baseline for changes:
- Run `npm run lint`.
- Run `npm run build` for production safety on significant changes.
- For UI behavior changes, manually verify:
- Markdown editing and preview rendering.
- Pagination behavior in `/draft`.
- Export ZIP workflow.
- Import modal flow (if touched) and API responses.

## Change Scope Expectations

- Keep diffs small and task-focused.
- Prefer incremental edits over broad rewrites.
- Touch only files needed for the requested outcome.
- Preserve existing behavior unless a change is intentional and documented.

## PR / Diff Expectations

- PR description should include:
- What changed.
- Why the change was needed.
- Tradeoffs or alternatives considered (brief).
- How it was validated (`lint`, `build`, manual checks).

- Diff quality expectations:
- Separate refactor from behavior changes where feasible.
- Keep naming and formatting consistent with nearby code.
- Add/update types when changing data contracts.
- Update docs when behavior or developer workflow changes.

## Commit Hygiene (recommended)

- Use clear, imperative commit messages.
- Group related edits in one commit when they ship together.
- Avoid mixing unrelated cleanup with feature/bugfix commits.

## Agent Workflow Notes

- Before major edits, inspect relevant files end-to-end.
- Prefer existing utilities and patterns over introducing new abstractions.
- If behavior is ambiguous, choose the least disruptive compatible approach.
- Flag assumptions clearly in PR notes when requirements are uncertain.

## Quick Reference

- Main editor page: `app/draft/page.tsx`
- Pagination logic: `hooks/useSmartPagination.ts`
- Markdown renderer: `components/MarkdownRenderer.tsx`
- Theme system: `lib/themeConfig.ts`
- Draft persistence: `lib/draftStorage.ts`
- Import API: `app/api/parse-wechat/route.ts`
- Image proxy API: `app/api/proxy-image/route.ts`
