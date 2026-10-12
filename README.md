# Chris Nussbaum: portfolio & freelance services site

A static, no-build website (HTML/CSS/JS). Open `index.html` or run `python3 -m http.server`.

## Customize
- **Calendly:** paste your event link into `calendlyUrl` at the top of `js/main.js`. The built-in email request form is then replaced by the Calendly scheduler, and each "Book this" button passes the service to Calendly as `utm_content`.
- **Without Calendly:** availability comes from `CONFIG` in `js/main.js` (work days, time slots, lead time, days ahead).
- **Content/services:** edit `index.html`.
- **Booking & contact forms** open a pre-filled email to you (no server needed). To receive submissions directly instead, point the forms at Formspree/Netlify Forms, or replace the booking section with a Calendly/Cal.com embed.
- **Hosting:** works as-is on GitHub Pages, Netlify, or Vercel.

## Work sample screenshots
Cards in the "Work samples" section show a placeholder until you add images. Save screenshots as `assets/work/redapt-website.webp`, `assets/work/redapt-linkedin.webp`, and `assets/work/redapt-events.webp` (about 1600x1000, top of the page works best). Only share what you're allowed to show publicly.

## Site structure
Five static pages sharing one stylesheet (`css/styles.css`) and one script (`js/main.js`):
- `index.html`: home: intro, highlights, and a "where to start" fork.
- `portfolio.html`: built from the resume: summary, experience, skills, education & honors, resume PDF (`assets/Christopher_Nussbaum_Resume_2026.pdf`).
- `services.html`: freelance offerings and how engagements work.
- `projects.html`: filterable project cards. Coding projects show a live, scaled iframe preview (`data-preview`); other cards use screenshots in `assets/work/`.
- `book.html`: Calendly booking (falls back to an email request form if `calendlyUrl` is blank) and contact options. "Book this" links use `book.html?service=...` to preselect a service.

The header and footer are repeated in each file (no build step), so update the nav in all five when it changes.

## Icons
Icons are an original two-tone SVG set (indigo stroke + purple detail) defined once per page as an inline `<symbol>` sprite and used with `<svg class="icon"><use href="#i-name"/></svg>`. To add or swap one, edit the sprite near the top of `index.html` / `services.html`. (Flaticon assets, if used later, need an account download and attribution under their free license.)

## Writing samples
Writing cards (Iterate.ai posts and Medium) live in `projects.html` under the **Writing** filter; `projects.html#writing` opens with that filter on. To show a screenshot on a card, save it as `assets/work/iterate-synthetic-data.webp`, `iterate-fourth-wave.webp`, `iterate-ai-bias.webp`, or `medium.webp`; until then the card shows the title on a purple gradient.
