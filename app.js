/* Niharika's blog: vanilla JS. Posts are Markdown files in /posts, listed in posts/index.json. */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'});
const readTime = p => Math.max(1, Math.round(p.body.split(/\s+/).length / 200)) + ' min read';
let POSTS = [];
let LOAD_ERROR = '';

const ico = {
 rss:'<svg viewBox="0 0 24 24"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>',
 theme:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
 gh:'<svg viewBox="0 0 24 24"><path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
 li:'<svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
 mail:'<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>'
};

/* ============ LOADING POSTS ============ */
function parsePost(file, raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta = {};
  if (m) m[1].split(/\r?\n/).forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  });
  return {
    slug: file.replace(/\.md$/, ''),
    title: meta.title || file,
    date: meta.date || '1970-01-01',
    description: meta.description || '',
    tags: (meta.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    thumb: meta.thumb || '',
    draft: meta.draft === 'true',
    body: m ? m[2] : raw
  };
}
async function loadPosts() {
  try {
    const files = await (await fetch('posts/index.json')).json();
    const raws = await Promise.all(files.map(f => fetch('posts/' + f).then(r => { if (!r.ok) throw new Error(f); return r.text(); })));
    POSTS = files.map((f, i) => parsePost(f, raws[i])).filter(p => !p.draft)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (e) {
    LOAD_ERROR = 'Could not load posts. If you opened this file directly, run a local server instead (see README).';
  }
}

/* ============ COMPONENTS ============ */
function Navbar(route) {
  const cur = route.type === 'category' ? route.name : null;
  return `<nav>
  <a class="brand" href="#/">${esc(SITE.name)}</a>
  <div class="links">
   <a href="#/" class="${route.type === 'home' ? 'on' : ''}">All</a>
   <div class="dd"><button id="ddbtn" aria-haspopup="true">Categories
     <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m2 4 3 3 3-3"/></svg></button>
    ${CategoryFilter(cur)}</div>
   <a href="#/about" class="${route.type === 'about' ? 'on' : ''}">About</a>
   <div class="ctl"><a href="${SITE.rss}" title="RSS" aria-label="RSS">${ico.rss}</a><button id="theme" aria-label="Toggle theme">${ico.theme}</button></div>
  </div></nav>`;
}
function CategoryFilter(cur) {
  return `<div class="menu" id="menu">${CATEGORIES.map(c =>
    `<a href="#/category/${encodeURIComponent(c)}" class="${c === cur ? 'on' : ''}">${esc(c)}</a>`).join('')}</div>`;
}
function Hero() {
  return `<section class="hero"><div><p>${SITE.intro}</p><div class="dots"><i></i><i></i><i></i></div></div>
  <img class="avatar" src="${esc(SITE.avatar)}" alt="${esc(SITE.name)}"></section>`;
}
function Tag(t) {
  return CATEGORIES.includes(t)
    ? `<a class="tag" href="#/category/${encodeURIComponent(t)}">${esc(t)}</a>`
    : `<span class="tag">${esc(t)}</span>`;
}
function PostCard(p) {
  return `<article class="post"><div class="pbody">
  <div class="date">${fmt(p.date)}</div>
  <h2><a href="#/post/${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
  <p class="desc">${esc(p.description)}</p>
  <div class="tags">${p.tags.map(Tag).join('')}</div></div>
  ${p.thumb ? `<img class="thumb" src="${esc(p.thumb)}" alt="" loading="lazy">` : ''}</article>`;
}
function PostList(posts, heading) {
  return `<p class="label">${esc(heading)}</p>` +
    (posts.length ? posts.map(PostCard).join('') : `<div class="empty">No posts here yet.</div>`);
}
function PostPage(p) {
  if (!p) return `<a class="back" href="#/">← Back to all posts</a><h1>Post not found</h1>`;
  return `<a class="back" href="#/">← Back to all posts</a>
  <h1>${esc(p.title)}</h1>
  <div class="meta">${p.tags[0] ? Tag(p.tags[0]).replace('class="tag"', 'class="tag"') : ''}<span class="sep"></span><span>${fmt(p.date)}</span><span class="sep"></span><span>${readTime(p)}</span></div>
  <div class="prose">${marked.parse(p.body)}</div>`;
}
function About() {
  return `<section class="about">
  <p>I'm ${esc(SITE.name)}. I like taking technical ideas apart until I understand how they work.</p>
  <p>This blog is my personal space for technical writing: research, engineering concepts, AI and backend topics, and interesting technologies worth sharing.</p>
  <h2>What I Do</h2>
  <p>I explore software systems, AI and backend engineering, and write up what I find. I believe in understanding a problem properly before reaching for a solution.</p>
  <h2>Contact</h2>
  <p>Feel free to reach out by <a href="mailto:${esc(SITE.email)}">email</a>, connect with me on <a href="${esc(SITE.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>, or see what I'm building on <a href="${esc(SITE.github)}" target="_blank" rel="noopener">GitHub</a>.</p>
  </section>`;
}
function Footer() {
  return `<span>${esc(SITE.name)} &middot; ${new Date().getFullYear()}</span>
  <div class="icons">
   <a href="${esc(SITE.github)}" aria-label="GitHub" target="_blank" rel="noopener">${ico.gh}</a>
   <a href="${esc(SITE.linkedin)}" aria-label="LinkedIn" target="_blank" rel="noopener">${ico.li}</a>
   <a href="mailto:${esc(SITE.email)}" aria-label="Email">${ico.mail}</a>
   <a href="${SITE.rss}" aria-label="RSS">${ico.rss}</a></div>`;
}

/* ============ ROUTER ============ */
function parse() {
  const [a, b] = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/');
  if (a === 'post') return {type:'post', slug:b};
  if (a === 'category') return {type:'category', name:b};
  if (a === 'about') return {type:'about'};
  return {type:'home'};
}
function render() {
  const r = parse();
  $('#nav').innerHTML = Navbar(r);
  let html = '';
  if (LOAD_ERROR) html = `<div class="empty">${esc(LOAD_ERROR)}</div>`;
  else if (r.type === 'home') html = Hero() + PostList(POSTS, 'Recent Posts');
  else if (r.type === 'category') html = `<a class="back" href="#/">← Back to all posts</a>` + PostList(POSTS.filter(p => p.tags.includes(r.name)), r.name);
  else if (r.type === 'post') html = PostPage(POSTS.find(p => p.slug === r.slug));
  else html = About();
  if (r.type === 'about') html = About();
  $('#app').innerHTML = html;
  const p = r.type === 'post' ? POSTS.find(x => x.slug === r.slug) : null;
  document.title = p ? `${p.title} · ${SITE.name}` : SITE.name;
  window.scrollTo(0, 0);
  const menu = $('#menu');
  $('#ddbtn').onclick = e => { e.stopPropagation(); menu.classList.toggle('open'); };
  menu.onclick = () => menu.classList.remove('open');
  $('#theme').onclick = toggleTheme;
}
document.addEventListener('click', () => { const m = $('#menu'); if (m) m.classList.remove('open'); });

/* ============ THEME ============ */
function toggleTheme() {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
}
try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

/* ============ START ============ */
$('#foot').innerHTML = Footer();
window.addEventListener('hashchange', render);
loadPosts().then(render);
