// Digital Signage - Main App Logic

let slides = [];        // Flat array of all renderable slides
let currentIndex = 0;
let cycleSeconds = 10;
let cycleTimer = null;

// ── Entry point ──────────────────────────────────────────────────────────────
async function loadConfig() {
  try {
    const res = await fetch('./config.json');
    const config = await res.json();
    await parseConfig(config);
    startCycler();
  } catch (e) {
    showError('Failed to load config.json: ' + e.message);
  }
}

// ── Parse config & expand RSS into multiple slides ────────────────────────────
async function parseConfig(config) {
  slides = [];

  for (const entry of config) {
    if (entry.cycle) {
      cycleSeconds = parseInt(entry.cycle, 10) || 10;
      continue;
    }

    if (entry.type === 'Image') {
      slides.push({ type: 'Image', url: entry.URL });
    }

    if (entry.type === 'RSS') {
      const items = await fetchRSS(entry.URL);
      for (const item of items) {
        slides.push({ type: 'RSS', item });
      }
    }
  }

  if (slides.length === 0) {
    showError('No slides found in config.json');
  }
}

// ── RSS Fetcher (via allorigins CORS proxy) ───────────────────────────────────
async function fetchRSS(url) {
  try {
    const proxy = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
    const res = await fetch(proxy);
    const text = await res.text();
    const xml = parser.parseFromString(text, 'text/xml');
    const items = [...xml.querySelectorAll('item')];

return items.map(item => ({
  title:       item.querySelector('title')?.textContent?.trim() || 'Untitled',
  description: stripHTML(item.querySelector('description')?.textContent || ''),
  pubDate:     item.querySelector('pubDate')?.textContent?.trim() || '',
  link:        item.querySelector('link')?.textContent?.trim() || '',
  source:      new URL(url).hostname.replace('www.', ''),
}));   
  } catch (e) {
    console.warn('RSS fetch failed:', e);
    return [{ title: 'RSS Unavailable', description: 'Could not load feed.', pubDate: '', link: '', source: url }];
  }
}

function stripHTML(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// ── Slide Cycler ─────────────────────────────────────────────────────────────
function startCycler() {
  showSlide(currentIndex);
  cycleTimer = setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
    updateProgressBar();
  }, cycleSeconds * 1000);
  updateProgressBar();
}

function updateProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.width = '0%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.transition = `width ${cycleSeconds}s linear`;
      bar.style.width = '100%';
    });
  });
}

// ── Slide Renderer ────────────────────────────────────────────────────────────
function showSlide(index) {
  const stage = document.getElementById('slide-stage');
  if (!stage || !slides[index]) return;

  const slide = slides[index];

  // Fade out
  stage.style.opacity = '0';
  stage.style.transform = 'scale(1.01)';

  setTimeout(() => {
    stage.innerHTML = '';

    if (slide.type === 'Image') {
      renderImage(stage, slide);
    } else if (slide.type === 'RSS') {
      renderRSS(stage, slide);
    }

    // Fade in
    stage.style.opacity = '1';
    stage.style.transform = 'scale(1)';

    // Slide counter
    const counter = document.getElementById('slide-counter');
    if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
  }, 350);
}

function renderImage(stage, slide) {
  const img = document.createElement('img');
  img.src = slide.url;
  img.alt = 'Signage Image';
  img.className = 'slide-image';
  stage.appendChild(img);
}

function renderRSS(stage, slide) {
  const { title, description, pubDate, source } = slide.item;
  const date = pubDate ? new Date(pubDate).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }) : '';

  const el = document.createElement('div');
  el.className = 'rss-slide';
  el.innerHTML = `
    <div class="rss-source">${escapeHTML(source)}</div>
    <div class="rss-title">${escapeHTML(title)}</div>
    ${date ? `<div class="rss-date">${escapeHTML(date)}</div>` : ''}
    <div class="rss-divider"></div>
    <div class="rss-body">${escapeHTML(description)}</div>
  `;
  stage.appendChild(el);
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showError(msg) {
  const stage = document.getElementById('slide-stage');
  if (stage) {
    stage.innerHTML = `<div class="error-msg">⚠️ ${msg}</div>`;
    stage.style.opacity = '1';
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initClock('clock-canvas');
  initWeather('weather-widget');
  loadConfig();
});