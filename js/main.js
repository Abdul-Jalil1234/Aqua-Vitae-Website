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
  revealTargets.forEach(el =>