# Repository Working Instructions

## Change history

For every user-requested website source or content edit, update `CHANGELOG.md` in the same commit. Add the newest entry at the top using the Asia/Manila date. Include a concise summary, visitor-facing locations, affected files, and validation/deployment status. Do not log read-only inspections.

Commit only files related to the requested change plus `CHANGELOG.md`. Preserve unrelated local and untracked files.

## Weekly video and study-note updates

Ask for both the new YouTube video or upcoming-live link and its matching Google Drive study-note link. If one is missing, add only the supplied item and ask for the other.

Update the weekly content in these active files:

- Main monthly-series video data: `app-v2.js`
- Main page cache-busting script reference: `index.html`
- Superfan video and study-note data: `study-note/study-notes.js`
- Superfan cache-busting script reference: `study-note/index.html`

Preserve previous entries. Replace the matching `Coming Soon` session when present. Validate JavaScript, check the diff, update `CHANGELOG.md`, commit the scoped files, push to `main`, wait for GitHub Pages, and verify both live locations.
