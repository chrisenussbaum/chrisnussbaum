# Chris Nussbaum: portfolio & freelance services site

A static, no-build website (HTML/CSS/JS). Open `index.html` or run `python3 -m http.server`.

## Customize
- **Calendly:** paste your event link into `calendlyUrl` at the top of `js/main.js`. The built-in email request form is then replaced by the Calendly scheduler, and each "Book this" button passes the service to Calendly as `utm_content`.
- **Without Calendly:** availability comes from `CONFIG` in `js/main.js` (work days, time slots, lead time, days ahead).
- **Content/services:** edit `index.html`.
- **Booking & contact forms** open a pre-filled email to you (no server needed). To receive submissions directly instead, point the forms at Formspree/Netlify Forms, or replace the booking section with a Calendly/Cal.com embed.
- **Hosting:** works as-is on GitHub Pages, Netlify, or Vercel.

## Work sample screenshots
Cards in the "Work samples" section show a placeholder until you add images. Save screenshots as `assets/work/redapt-website.webp` and `assets/work/redapt-linkedin.webp` (about 1600x1000, top of the page works best). Only share what you're allowed to show publicly.
