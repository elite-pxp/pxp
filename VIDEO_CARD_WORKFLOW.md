# Video Card Workflow

Use this exact process when adding a new video card.

1. Duplicate the latest card
- In both files:
`index.html`
`Email pxp Marketing/index.html`
- Copy the first `.video-card` inside `.video-grid` and paste it above the first card.

2. Collect required inputs before editing
- Embedded video link
- Study notes link
- Video title
- Video description
- Upload date

3. Update required fields in the duplicated card
- `iframe src` = embedded video link
- `iframe title` = video title
- `.video-title` text = video title
- `.video-date` text = `Uploaded: Month DD, YYYY`
- `.video-description` text = video description
- `.download-button href` = study notes link

4. Keep behavior and structure unchanged
- Keep:
`<button type="button" class="toggle-description">See more</button>`
`<a class="download-button">Download Study Notes</a>`
- Do not change class names or card layout structure.

5. Verify before finalizing
- New card is first (top) in both files.
- Upload date exists and is correct.
- Title and description are present.
- Card appears in both `index.html` and `Email pxp Marketing/index.html`.
