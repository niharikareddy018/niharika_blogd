/* Run: node build-index.js
   Scans /posts for .md files and writes posts/index.json (+ rss.xml).
   Files starting with "_" and posts with "draft: true" are skipped. */
const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://example.com').replace(/\/$/, '');
const SITE_NAME = 'Niharika Muduru';
const dir = path.join(__dirname, 'posts');

const meta = file => {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const o = {};
  if (m) m[1].split(/\r?\n/).forEach(l => {
    const i = l.indexOf(':');
    if (i > 0) o[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  });
  return { file, slug: file.replace(/\.md$/, ''), title: o.title || file, date: o.date || '1970-01-01', description: o.description || '', draft: o.draft === 'true' };
};

const posts = fs.readdirSync(dir)
  .filter(f => f.endsWith('.md') && !f.startsWith('_'))
  .map(meta)
  .filter(p => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(posts.map(p => p.file), null, 2) + '\n');

const x = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${x(SITE_NAME)}</title><link>${SITE_URL}</link>
<description>Technical articles and research</description>
${posts.map(p => `<item><title>${x(p.title)}</title><link>${SITE_URL}/#/post/${p.slug}</link><guid>${SITE_URL}/#/post/${p.slug}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${x(p.description)}</description></item>`).join('\n')}
</channel></rss>
`;
fs.writeFileSync(path.join(__dirname, 'rss.xml'), rss);

console.log(`Indexed ${posts.length} posts.`);
