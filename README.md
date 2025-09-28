# Family Adventures in Israel

Interactive map that highlights family-friendly attractions across Israel. Built with Leaflet and OpenStreetMap data, it provides quick info, highlights, and directions for each location.

## Features
- Filterable list of curated attractions with categories, seasons, and search.
- Leaflet-powered map with rich popups and quick zoom controls.
- Direct links to official websites and navigation directions for every spot.
- Road-trip friendly desert stops between the Negev and Eilat with dedicated category filters.
- Road-access filter that highlights where standard cars, high-clearance 2x4s, or light 4x4 crossovers are recommended.
- Language toggle that swaps the entire interface and attraction details between English and Hebrew (with RTL support).
- Responsive layout and dark-mode friendly styling.

## Getting Started
1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
2. If your browser blocks local module imports, start a lightweight server from the project root:
   - Python 3: `python3 -m http.server 5500`
   - Node.js: `npx http-server`
3. Visit the shown localhost URL (e.g. http://localhost:5500) and start exploring.

No build step is required; the site is entirely static and relies on free Leaflet + OpenStreetMap tiles.

## Deployment
- Vercel: `vercel --prod` (or use the Vercel dashboard). When prompted, choose the root as the project directory and the default settings (build command: none, output directory: none).
- GitHub Pages / Netlify / Render: treat this repo as a static site; the `index.html` at the root is the entrypoint and `data`, `scripts`, and `styles` directories must be published alongside it.
- Custom hosting: serve the folder contents over HTTPS; no server-side code or environment variables are required.

The app is fully static, references only CDN-hosted Leaflet assets, and loads its dataset from local files relative to the published root, so it works on any static host.
