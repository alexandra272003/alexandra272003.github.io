# Alexandra Pratap Singh — Portfolio

A single-page portfolio built with **Vue 3**, **GSAP + ScrollTrigger**, **Three.js**, **particles.js**, and vanilla **Canvas** games.
No build step — just static files, ready for GitHub Pages.

## What's inside
- `index.html` — page structure + Vue app mount point.
- `css/style.css` — full design system (dark mission-control / flight-computer theme: signal cyan + ignition amber, HUD corner brackets, telemetry type).
- `js/app.js` — Vue app (content, nav state, tab/filter state, GSAP scroll orchestration).
- `js/heroScene.js` — Three.js hero scene: rotating wireframe core + orbiting particle field, mouse-parallax.
- `js/particlesConfig.js` — particles.js ambient network background, palette-matched.
- `js/games/flappyBird.js` — hand-written Flappy Bird (canvas).
- `js/games/alienShooter.js` — endless-wave alien shooter (canvas).

## What's new in this pass
- **Three.js hero scene** — a rotating wireframe icosahedron with an orbiting particle shell, sitting behind the hero copy and gently tracking the pointer.
- **particles.js ambient field** — a full-page, palette-matched particle network with a subtle hover "grab" interaction, layered behind the existing HUD grid.
- **Cinematic GSAP/ScrollTrigger** — the About portrait now pins in place while the copy scrolls past it (desktop only); section titles decode in with a matrix-style scramble as they enter the viewport; the Project Archive has a scroll-scrubbed "mission progress rail" that fills as you move through the list.
- **Richer Vue interactivity** — Skills is now an animated tab interface with a sliding indicator; the Project Archive has a live search box and toggleable tag chips, with entries animating in/out via `<transition-group>`.

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
- Projects, skills, and stats live in `js/app.js` at the top of `setup()` — edit the arrays directly, no build step needed.
- Colors, fonts, and layout tokens are in the `:root` block at the top of `css/style.css`.
- Hero 3D scene tuning (core size, particle count/color, rotation speed) lives in `js/heroScene.js`.
- Ambient particle background tuning (count, colors, link distance) lives in `js/particlesConfig.js`.

## Notes
- Both games save a personal best to `localStorage` (per-browser).
- All external libraries (Vue, GSAP, ScrollTrigger, Three.js, particles.js, Google Fonts) load from CDNs — no `npm install` required.
- All new motion (3D scene, particles, scramble text, pinning) respects `prefers-reduced-motion` and degrades to a static, still-readable page.

