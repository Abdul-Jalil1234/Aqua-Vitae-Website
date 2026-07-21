/*
   AQUA VITAE INITIATIVE — main.js
   Navigation, theming, scroll reveals, counters, form validation,
   accordion polish, command-style search, and micro-interactions.
   */

document.addEventListener('DOMContentLoaded', () => {

  /*          Preloader          */
  const preloader = document.querySelector('.preloader');
  if (preloader){
    const dismiss = () => setTimeout(() => preloader.classList.add('done'), 300);
    if (document.readyState === 'complete') dismiss();
    else window.addEventListener('load', dismiss);
    setTimeout(() => preloader.classList.add('done'), 2200); // safety fallback
  }

  /*           Scroll progress bar          */
  const scrollProgress = document.querySelector('.scroll-progress');
  function updateScrollProgress(){
    if (!scrollProgress) return;
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100;
    scrollProgress.style.width = Math.min(Math.max(scrolled, 0), 100) + '%';
  }
  document.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /*                    Back to top             */
  const backToTop = document.querySelector('.back-to-top');
  document.addEventListener('scroll', () => {
    backToTop?.classList.toggle('show', window.scrollY > 480);
  }, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /*                  Hamburger / Off-canvas nav             */
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.nav-drawer');
  const drawerClose = document.querySelector('.nav-drawer-close');
  const scrim = document.querySelector('.scrim');

  function openDrawer(){
    drawer?.classList.add('open');
    scrim?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(){
    drawer?.classList.remove('open');
    scrim?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  hamburger?.addEventListener('click', () => {
    drawer?.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  drawerClose?.addEventListener('click', closeDrawer);
  scrim?.addEventListener('click', () => { closeDrawer(); closeSearch(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ closeDrawer(); closeSearch(); } });

  /*            Active nav link             */
  const current = (location.pathname.split('/').pop() || 'index.html');
 document.querySelectorAll('.nav-drawer a[href], .nav-links a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')){
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /*         Theme toggle (Dark / Light mode)  */
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('av-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme', 'dark');

  themeToggle?.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('av-theme', isDark ? 'light' : 'dark');
  });

  /*             Scroll reveal            */
  const revealTargets = document.querySelectorAll('.reveal, .water-ring, .progress-bar-fill, .skill-fill, [data-counter]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        if (entry.target.hasAttribute('data-counter')) animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  revealTargets.forEach(el => io.observe(el));

  /*              Animated counters            */
  function animateCounter(el){
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /*            Header shadow on scroll           */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  /*           Magnetic buttons (subtle pointer-follow)      */
  document.querySelectorAll('.btn-primary, .theme-toggle').forEach(btn => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.18;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
  /*             Subscribe button: synthesized confirmation chime     */
  const subscribeBtn = document.querySelector('#subscribe-btn');
  const subscribeLabel = document.querySelector('#subscribe-label');

  function playSubscribeChime(){
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const notes = [660, 880]; // two-tone ascending confirmation chime
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const start = now + i * 0.12;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch (e) {
      console.warn('Audio playback unavailable:', e);
    }
  }

  if (subscribeBtn){
    subscribeBtn.addEventListener('click', () => {
      const nowSubscribed = subscribeBtn.classList.toggle('subscribed');
      subscribeBtn.setAttribute('aria-pressed', nowSubscribed);
      subscribeLabel.textContent = nowSubscribed ? 'Subscribed ✓' : 'Subscribe for Updates';
      playSubscribeChime();
    });
  }

  /*             Accordion: close siblings for a tidy FAQ            */
  document.querySelectorAll('.accordion details').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open){
        document.querySelectorAll('.accordion details').forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /*          Contact form: live regex validation + toast    */
  const form = document.querySelector('#contact-form');
  if (form){
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      field.addEventListener('input', () => {
        // Forces :placeholder-shown / :valid / :invalid styling to re-evaluate live
        field.setAttribute('data-touched', 'true');
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()){
        form.reportValidity();
        showToast('Almost there', 'Please correct the highlighted fields before submitting.', false);
        return;
      }
      showToast('Message sent successfully', 'Thank you — the Aqua Vitae team will respond within 2 business days.', true);
      form.reset();
      fields.forEach(f => f.removeAttribute('data-touched'));
    });
  }

  function showToast(title, message, success){
    let toast = document.querySelector('.toast');
    if (!toast){
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-6"></path></svg>
        <div><h4></h4><p></p></div>`;
      document.body.appendChild(toast);
    }
    toast.style.borderLeftColor = success ? 'var(--color-success)' : 'var(--color-danger)';
    toast.querySelector('h4').textContent = title;
    toast.querySelector('p').textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
  }

  /*                    Command-style Search (Ctrl/Cmd + K)            */
  const SEARCH_INDEX = [
    { title: 'Home — Aqua Vitae Initiative', desc: 'Clean water, restored dignity. Our hero mission statement.', url: 'index.html#top' },
    { title: 'What We Do', desc: 'Community workshops, water treatment kits, borehole advocacy.', url: 'index.html#what-we-do' },
    { title: 'Our Mission & Impact', desc: 'Full mission detail, GCGO alignment, challenge & opportunity.', url: 'mission.html#top' },
    { title: 'Why This Mission — Global Goals', desc: 'SDG 3, 6, 1 and 5 alignment for our water access work.', url: 'mission.html#why' },
    { title: 'Impact Timeline', desc: 'Milestones from founding through our five-year target.', url: 'mission.html#timeline' },
    { title: 'Field Gallery', desc: 'Workshops, kit distribution and borehole drilling in the field.', url: 'mission.html#gallery' },
    { title: 'Our Five-Year Vision', desc: '7 in every 10 rural families with reliable safe water access.', url: 'mission.html#vision' },
    { title: 'About — Founder Bio', desc: 'The journey behind the Aqua Vitae Initiative.', url: 'about.html#bio' },
    { title: 'Skills Dashboard', desc: 'Technical and soft skills behind our engineering team.', url: 'about.html#skills' },
    { title: 'Meet the Team', desc: 'Software engineering students building this mission.', url: 'about.html#team' },
    { title: 'Contact Us', desc: 'Reach out to volunteer, donate, or partner with us.', url: 'contact.html#top' },
    { title: 'Support Us — Donate Treatment Kits', desc: 'Fund water treatment kits for families in need.', url: 'support.html#tiers' },
    { title: 'Support Us — Sponsor a Borehole', desc: 'Contribute toward long-term mechanized water infrastructure.', url: 'support.html#tiers' },
    { title: 'Support Us — Volunteer', desc: 'Offer your time and expertise to our field programs.', url: 'support.html#ways' },
   { title: 'Frequently Asked Questions', desc: 'Answers about donations, volunteering and our impact.', url: 'support.html#faq' },
    { title: 'Field Updates', desc: 'News, progress notes and milestones from our field teams.', url: 'updates.html#top' },
  ];

  const searchTrigger = document.querySelectorAll('.search-trigger');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchInput = document.querySelector('#search-input');
  const searchResults = document.querySelector('#search-results');

  function openSearch(){
    searchOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput?.focus(), 60);
    renderResults('');
  }
  function closeSearch(){
    searchOverlay?.classList.remove('open');
    document.body.style.overflow = '';
    if (searchInput) searchInput.value = '';
  }
  searchTrigger.forEach(btn => btn.addEventListener('click', openSearch));
  searchOverlay?.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
  document.querySelector('.search-close')?.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      searchOverlay?.classList.contains('open') ? closeSearch() : openSearch();
    }
  });

  function renderResults(query){
    if (!searchResults) return;
    const q = query.trim().toLowerCase();
    const matches = q === ''
      ? SEARCH_INDEX
      : SEARCH_INDEX.filter(item =>
          item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));

    searchResults.innerHTML = '';
    if (matches.length === 0){
      searchResults.innerHTML = `<li class="search-empty">No results for “${escapeHtml(query)}”. Try “boreholes”, “volunteer”, or “vision”.</li>`;
      return;
    }
    matches.forEach((item, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.url}" style="--i:${i}">
          <span class="result-title">${highlight(item.title, q)}</span>
          <span class="result-desc">${highlight(item.desc, q)}</span>
        </a>`;
      searchResults.appendChild(li);
    });
  }

  function highlight(text, q){
    if (!q) return escapeHtml(text);
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + q.length)) + '</mark>' + escapeHtml(text.slice(idx + q.length));
  }
  function escapeHtml(str){
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  searchInput?.addEventListener('input', (e) => renderResults(e.target.value));

  /*                Custom cursor glow (desktop delight)           */
  if (window.matchMedia('(pointer:fine)').matches){
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    window.addEventListener('pointermove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  }

  /*         Reveal-on-load hero           */
  document.querySelectorAll('.hero-fade').forEach((el, i) => {
    el.style.setProperty('--i', i);
    requestAnimationFrame(() => el.classList.add('in-view'));
  });

});
