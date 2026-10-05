# Alexandra Pratap Singh — Portfolio

A single-page portfolio built with **Vue 3** and vanilla **Canvas**. Playful game-style UI: pastel colors, thick outlines, falling sprinkles, confetti, hidden secrets, and two playable games.
No build step, just static files, ready for GitHub Pages.

## What's inside
- `index.html`: page structure + Vue app mount point.
- `css/style.css`: the whole design (pastel palette, drips between sections, animated backgrounds, HUD, cards, modals).
- `js/app.js`: Vue app (projects, skills, stats, search/filter, secrets hunt, game modal).
- `js/sprinkles.js`: falling-sprinkle background canvas + the confetti engine.
- `js/games/flappyBird.js`: hand-written Flappy Bird (canvas).
- `js/games/alienShooter.js`: endless-wave alien shooter (canvas).
- `images/`: your photo (`me-now.jpg`) and the two game preview screenshots.

## Features
- **Hero:** photo on the left, bio on the right, with a scoreboard of highlights underneath.
- **Projects:** live search box and technology chips, with cards animating in and out.
- **Secrets hunt:** 7 hidden items to find. Click the candy counter in the top bar for hints and a checklist. Every find fires confetti, and finding all 7 triggers a celebration. Progress is saved in the browser.
- **Easter egg:** try the Konami code (up, up, down, down, left, right, left, right, B, A).
- **Arcade:** Flappy Bird and Alien Onslaught open in a modal. Best scores are saved in the browser.
- **Motion:** sprinkles, drifting backgrounds, and floating shapes all respect `prefers-reduced-motion`.

## Run locally
Any static server works, e.g.:
```bash
cd portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages
1. Create a new repo, e.g. `alexandra272003.github.io` (for a user site) or any repo name (for a project site).
2. Push these files to the repo root (or a `docs/` folder):
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source: Deploy from a branch**, branch **main**, folder **/ (root)** (or `/docs` if you used that).
5. Save. Your site will be live at:
   - `https://<username>.github.io/` (if the repo is named `<username>.github.io`), or
   - `https://<username>.github.io/<repo>/` otherwise.
6. Add the link to your LinkedIn "Featured" section and GitHub profile README.

## Editing content
- **Projects, skills, stats:** arrays at the top of `setup()` in `js/app.js`. Edit them directly.
- **Repo links:** several project entries still point to `https://github.com/alexandra272003?tab=repositories`. Search `app.js` for `?tab=repositories` and replace each with the exact repo URL.
- **Secrets:** the `secrets` array in `js/app.js` holds the names and hints. The hidden buttons live in `index.html` (look for `class="secret`).
- **Colors and fonts:** the `:root` block at the top of `css/style.css`.
- **Sprinkles and confetti:** counts, colors and speed live in `js/sprinkles.js`.
- **Hero photo:** replace `images/me-now.jpg`.

## Notes
- Vue and Google Fonts (Bangers, Fredoka, Permanent Marker) load from CDNs, so no `npm install` is needed.
- Both games and the secrets hunt save progress to `localStorage` (per browser).
