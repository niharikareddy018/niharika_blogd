# Niharika's blog

Plain HTML, CSS and JavaScript. No framework, no build tools beyond one tiny Node script.

## Add a post
1. Copy `posts/_template.md` to `posts/my-post.md` (the filename becomes the URL).
2. Fill in the top block (title, date, description, tags, optional thumb) and write the post in Markdown.
3. Remove the `draft: true` line when ready.
4. Run `node build-index.js` (updates `posts/index.json` and `rss.xml`).
5. Push to GitHub. Netlify / Vercel / GitHub Pages will publish it.

On Netlify or Vercel, set the build command to `node build-index.js` and the publish directory to `.`
so step 4 runs automatically. Set `SITE_URL=https://your-site.com` as an environment variable for correct RSS links.

## Add a category
Add a string to `CATEGORIES` in `config.js`. Use the same word in a post's `tags`.

## Change intro, photo, links, accent color
- Intro, photo, GitHub / LinkedIn / email: `config.js`
- Accent color: `--accent` at the top of `style.css`

## Run locally
Opening index.html directly will not load posts (browsers block it). Use a local server:
`npx serve .` or `python3 -m http.server`, then open the address it prints.
