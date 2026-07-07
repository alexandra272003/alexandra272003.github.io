/* ==========================================================================
   ALEXANDRA PRATAP SINGH — PORTFOLIO
   Vue 3 app: content data, nav/section state, GSAP scroll orchestration,
   boot sequence, stat counters, and the game modal bridge.
   ========================================================================== */

const { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;

createApp({
  setup(){

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- Content data ---------------- */

    const navLinks = [
      { id: 'about',     label: 'Profile'   },
      { id: 'skills',    label: 'Systems'   },
      { id: 'projects',  label: 'Archive'   },
      { id: 'simulator', label: 'Simulator' },
      { id: 'contact',   label: 'Transmit'  },
    ];

    const stats = [
      { value: 6,  suffix: '+',    label: 'Shipped ML Projects' },
      { value: 90, suffix: '%',    label: 'Peak Model Accuracy' },
      { value: 60, suffix: '%',    label: 'Faster Resume Screening' },
      { value: 5,  suffix: '/198', label: 'UHACK 3.0 Finish' },
    ];

    const skillGroups = [
      {
        code: 'ML.01', title: 'Machine Learning',
        tools: ['Scikit-Learn', 'TensorFlow', 'PyTorch', 'Feature Engineering'],
      },
      {
        code: 'DATA.02', title: 'Data & Analysis',
        tools: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Power BI'],
      },
      {
        code: 'SYS.03', title: 'Databases & Infra',
        tools: ['MySQL', 'MongoDB', 'Git & GitHub', 'AWS', 'GCP'],
      },
      {
        code: 'WEB.04', title: 'Web & Tooling',
        tools: ['HTML', 'CSS', 'JavaScript', 'VS Code', 'Google Colab'],
      },
    ];

    const projects = [
      {
        name: 'CleanFrame',
        tagline: 'Decorator-based pandas cleaning, published to PyPI',
        desc: 'A lightweight Python library that validates and cleans pandas DataFrames automatically before they reach your function — drop nulls, normalize columns, and enforce schema with one decorator instead of repetitive boilerplate.',
        tags: ['Python', 'Pandas', 'Decorators', 'PyPI'],
        metric: 'MIT', metricLabel: 'Open Source License',
        url: 'https://github.com/alexandra272003/PYCLEAN_FRAME',
      },
      {
        name: 'PentamedConsorsio',
        tagline: 'Full-stack vaccination tracking platform',
        desc: 'Built at UHACK 3.0 — real-time vaccination record management with a full-stack architecture spanning frontend, backend, and database, designed to help clinics track doses at scale.',
        tags: ['Python', 'JavaScript', 'HTML/CSS', 'MongoDB'],
        metric: 'Top 5', metricLabel: 'of 198 Teams — UHACK 3.0',
        url: 'https://github.com/alexandra272003',
      },
      {
        name: 'Predictive Maintenance System',
        tagline: 'Multi-model ML for equipment failure prediction',
        desc: 'Trained Random Forest, SVM, and XGBoost classifiers on 10,000+ equipment sensor records to flag failures before they happen, handling class imbalance with SMOTE and cutting dimensionality with PCA.',
        tags: ['Scikit-Learn', 'XGBoost', 'SMOTE', 'PCA'],
        metric: '85%+', metricLabel: 'Classification Accuracy',
        url: 'https://github.com/alexandra272003/Predictive-Maintenance-Using-Multi-Model',
      },
      {
        name: 'Resume Shortlisting System',
        tagline: 'NLP pipeline for automated candidate ranking',
        desc: 'Processes hundreds of resumes with keyword extraction and NLP-based ranking, outputting shortlists aligned to job descriptions — cut recruiter review time significantly in pilot testing.',
        tags: ['Python', 'NLTK', 'NLP', 'Scikit-Learn'],
        metric: '60%', metricLabel: 'Faster Review Time',
        url: 'https://github.com/alexandra272003',
      },
      {
        name: 'Heart Disease Classification',
        tagline: 'End-to-end ML pipeline on the UCI dataset',
        desc: 'Full classification workflow — EDA, preprocessing, and feature engineering across Logistic Regression, KNN, and Random Forest — with hyperparameter tuning for the best-performing model.',
        tags: ['Scikit-Learn', 'Pandas', 'Seaborn', 'Jupyter'],
        metric: '90%', metricLabel: 'Best Model Accuracy',
        url: 'https://github.com/alexandra272003/Heart-Disease-Classification-Project',
      },
      {
        name: 'Blue Book for Bulldozers',
        tagline: 'Kaggle regression for heavy-equipment pricing',
        desc: 'End-to-end regression workflow on the Kaggle Blue Book for Bulldozers dataset — date-based feature extraction, preprocessing, and model tuning to predict heavy equipment auction sale prices.',
        tags: ['Python', 'Scikit-Learn', 'Regression', 'Feature Engineering'],
        metric: '0.246', metricLabel: 'RMSLE Score',
        url: 'https://github.com/alexandra272003/Blue-Book-Bulldozers-Regression-Project',
      },
    ];

    /* ---------------- Skills tabs ---------------- */

    const activeSkillIndex = ref(0);
    const skillsTabRefs = ref([]);
    const skillsIndicator = ref(null);

    function setSkillsTabRef(el, i){
      if(el) skillsTabRefs.value[i] = el;
    }

    function moveSkillsIndicator(){
      const btn = skillsTabRefs.value[activeSkillIndex.value];
      const indicator = skillsIndicator.value;
      if(!btn || !indicator) return;
      const btnRect = btn.getBoundingClientRect();
      const parentRect = btn.parentElement.getBoundingClientRect();
      const x = btnRect.left - parentRect.left;
      const w = btnRect.width;
      if(!prefersReducedMotion && typeof gsap !== 'undefined'){
        gsap.to(indicator, { x, width: w, duration: 0.45, ease: 'power3.out' });
      } else {
        indicator.style.transform = `translateX(${x}px)`;
        indicator.style.width = w + 'px';
      }
    }

    watch(activeSkillIndex, () => { nextTick(moveSkillsIndicator); });

    /* ---------------- Projects search / tag filter ---------------- */

    const searchQuery = ref('');
    const activeTags = ref([]);
    const railFill = ref(null);

    const allTags = computed(() => {
      const set = new Set();
      projects.forEach((p) => p.tags.forEach((t) => set.add(t)));
      return Array.from(set);
    });

    const filteredProjects = computed(() => {
      const q = searchQuery.value.trim().toLowerCase();
      return projects.filter((p) => {
        const matchesQuery = !q
          || p.name.toLowerCase().includes(q)
          || p.tagline.toLowerCase().includes(q)
          || p.desc.toLowerCase().includes(q)
          || p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesTags = activeTags.value.length === 0
          || activeTags.value.some((t) => p.tags.includes(t));
        return matchesQuery && matchesTags;
      });
    });

    function toggleTag(tag){
      const idx = activeTags.value.indexOf(tag);
      if(idx === -1) activeTags.value.push(tag);
      else activeTags.value.splice(idx, 1);
    }

    /* ---------------- Hero 3D scene / ambient particles ---------------- */

    const heroCanvas = ref(null);
    let heroSceneInstance = null;

    function initHeroScene(){
      if(heroCanvas.value && window.HeroScene){
        heroSceneInstance = window.HeroScene.init(heroCanvas.value);
      }
    }

    function initParticlesBg(){
      if(window.ParticlesBg) window.ParticlesBg.init();
    }

    /* ---------------- Boot sequence ---------------- */

    const booted = ref(prefersReducedMotion);
    const bootProgress = ref(prefersReducedMotion ? 100 : 0);

    function runBoot(){
      if(prefersReducedMotion){ afterBoot(); return; }
      const timer = setInterval(() => {
        bootProgress.value = Math.min(100, bootProgress.value + (Math.random() * 16 + 8));
        if(bootProgress.value >= 100){
          clearInterval(timer);
          setTimeout(() => { booted.value = true; afterBoot(); }, 280);
        }
      }, 130);
    }

    function afterBoot(){
      animateStats();
      runHeroIntro();
    }

    /* ---------------- Stat counters (scramble-then-settle) ---------------- */

    function animateStats(){
      const els = document.querySelectorAll('.stat-value');
      els.forEach((el) => {
        const target = parseFloat(el.dataset.count);
        if(prefersReducedMotion || typeof gsap === 'undefined'){
          el.textContent = target;
          return;
        }
        let frame = 0;
        const scrambleFrames = 9;
        const scramble = setInterval(() => {
          el.textContent = Math.floor(Math.random() * (target > 20 ? 99 : 9));
          frame++;
          if(frame >= scrambleFrames){
            clearInterval(scramble);
            const proxy = { val: 0 };
            gsap.to(proxy, {
              val: target, duration: 1.1, ease: 'power2.out',
              onUpdate: () => { el.textContent = Math.floor(proxy.val); },
            });
          }
        }, 45);
      });
    }

    /* ---------------- GSAP orchestration ---------------- */

    function splitChars(el){
      const text = el.textContent;
      el.textContent = '';
      const frag = document.createDocumentFragment();
      text.split('').forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.style.display = 'inline-block';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        frag.appendChild(span);
      });
      el.appendChild(frag);
      return el.querySelectorAll('.char');
    }

    function runHeroIntro(){
      if(prefersReducedMotion || typeof gsap === 'undefined') return;

      const lines = document.querySelectorAll('.hero-title .line');
      let charDelay = 0;
      lines.forEach((line, i) => {
        const chars = splitChars(line);
        gsap.from(chars, {
          yPercent: 110, opacity: 0, duration: 0.7, ease: 'power4.out',
          stagger: 0.02, delay: 0.1 + i * 0.25,
        });
        charDelay = 0.1 + i * 0.25 + chars.length * 0.02;
      });

      gsap.from('.hero [data-reveal]', {
        opacity: 0, y: 24, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        delay: charDelay + 0.1,
      });
      gsap.from('.hero-stats', {
        opacity: 0, y: 20, duration: 0.9, delay: charDelay + 0.5, ease: 'power3.out',
      });
    }

    function initScrollReveals(){
      if(prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
      gsap.registerPlugin(ScrollTrigger);

      document.querySelectorAll('main > section:not(.hero)').forEach((section) => {
        const targets = section.querySelectorAll(
          '.section-head, .about-portrait, .about-copy > *, .skills-tabs, .skills-panel-wrap, .projects-filter, .project-row, .arcade-card, .contact-actions, .contact-links'
        );
        if(!targets.length) return;
        gsap.from(targets, {
          opacity: 0, y: 26, duration: 0.7, ease: 'power2.out', stagger: 0.07,
          scrollTrigger: { trigger: section, start: 'top 80%' },
        });
      });

      // Parallax drift on the hero background layers as the page scrolls away
      gsap.to('.hero-horizon', {
        y: 130, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
      gsap.to('.hero-aura', {
        y: -90, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    }

    /* ---------------- Cinematic scroll: scramble titles ---------------- */

    const SCRAMBLE_GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

    function scrambleReveal(el, finalText, duration){
      let frame = 0;
      const totalFrames = Math.round(duration * 60);
      const timer = setInterval(() => {
        let out = '';
        for(let i = 0; i < finalText.length; i++){
          if(finalText[i] === ' '){ out += ' '; continue; }
          const revealAt = (i / finalText.length) * totalFrames + totalFrames * 0.35;
          out += frame >= revealAt ? finalText[i] : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        }
        el.textContent = out;
        frame++;
        if(frame > totalFrames){
          el.textContent = finalText;
          clearInterval(timer);
        }
      }, 1000 / 60);
    }

    function initScrambleTitles(){
      if(prefersReducedMotion || typeof ScrollTrigger === 'undefined') return;
      document.querySelectorAll('.section-title').forEach((el) => {
        if(el.children.length) return; // skip titles with markup (e.g. <br/>)
        const finalText = el.textContent;
        ScrollTrigger.create({
          trigger: el, start: 'top 85%', once: true,
          onEnter: () => scrambleReveal(el, finalText, 0.85),
        });
      });
    }

    /* ---------------- Cinematic scroll: mission progress rail ---------------- */

    function initProjectsRail(){
      if(prefersReducedMotion || typeof ScrollTrigger === 'undefined') return;
      ScrollTrigger.create({
        trigger: '.projects-body',
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: true,
        onUpdate(self){
          if(railFill.value) railFill.value.style.height = (self.progress * 100) + '%';
        },
      });
    }

    /* ---------------- Pointer-driven flourishes ---------------- */

    function initCursor(){
      if(prefersReducedMotion || typeof gsap === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;
      const cursor = document.createElement('div');
      cursor.className = 'hud-cursor';
      document.body.appendChild(cursor);
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      const moveX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
      const moveY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
      window.addEventListener('mousemove', (e) => { moveX(e.clientX); moveY(e.clientY); });

      document.querySelectorAll('a, button, .arcade-card, .project-row, .skills-tab, .tag-chip').forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
      });
    }

    function initMagneticButtons(){
      if(prefersReducedMotion || typeof gsap === 'undefined') return;
      document.querySelectorAll('.btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(btn, { x: x * 0.25, y: y * 0.45, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        });
      });
    }

    function initCardTilt(){
      if(prefersReducedMotion || typeof gsap === 'undefined') return;
      document.querySelectorAll('.arcade-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, {
            rotateY: px * 7, rotateX: -py * 7, duration: 0.4, ease: 'power2.out',
            transformPerspective: 600,
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
        });
      });
    }

    function initHeroParallax(){
      if(prefersReducedMotion || typeof gsap === 'undefined') return;
      window.addEventListener('mousemove', (e) => {
        const relX = e.clientX / window.innerWidth - 0.5;
        gsap.to('.hero-aura', { x: relX * -40, duration: 0.7, ease: 'power2.out' });
      });
    }

    /* ---------------- Nav / scroll state ---------------- */

    const scrolled = ref(false);
    const menuOpen = ref(false);
    const activeSection = ref('hero');
    const sectionIds = ['hero', 'about', 'skills', 'projects', 'simulator', 'contact'];
    const scrollProgress = ref(null);
    const avatarLoaded = ref(false);

    /* ---------------- Theme Management ---------------- */

    const THEME_KEY = 'aps_portfolio_theme';
    const isDark = ref(true);

    function initTheme(){
      // Check localStorage first, then system preference
      const saved = localStorage.getItem(THEME_KEY);
      if(saved){
        isDark.value = saved === 'dark';
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDark.value = prefersDark;
      }
      applyTheme();
    }

    function toggleTheme(){
      isDark.value = !isDark.value;
      localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light');
      applyTheme();
    }

    function applyTheme(){
      if(isDark.value){
        document.documentElement.classList.remove('light-theme');
      } else {
        document.documentElement.classList.add('light-theme');
      }
    }

    function initObservers(){
      // Scroll progress bar
      window.addEventListener('scroll', () => {
        scrolled.value = window.scrollY > 10;
        
        // Update scroll progress indicator
        if(scrollProgress.value){
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = (window.scrollY / docHeight) * 100;
          scrollProgress.value.style.transform = `scaleX(${scrollPercent / 100})`;
        }
      }, { passive: true });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if(entry.isIntersecting) activeSection.value = entry.target.id;
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if(el) observer.observe(el);
      });
    }

    /* ---------------- Game modal bridge ---------------- */

    const activeGame = ref(null);
    const gameCanvas = ref(null);
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    let runningGame = null;

    function openGame(key){
      activeGame.value = key;
      // Lock body scroll while the game modal is open — prevents the page from
      // scrolling when the player swipes on Android Chrome.
      document.body.classList.add('game-open');
      nextTick(() => {
        const canvas = gameCanvas.value;
        if(!canvas) return;
        if(key === 'flappy' && window.FlappyBirdGame){
          runningGame = window.FlappyBirdGame.init(canvas);
        } else if(key === 'alien' && window.AlienShooterGame){
          runningGame = window.AlienShooterGame.init(canvas);
        }
      });
    }

    function closeGame(){
      if(runningGame && typeof runningGame.destroy === 'function') runningGame.destroy();
      runningGame = null;
      activeGame.value = null;
      document.body.classList.remove('game-open');
    }

    /* ---------------- Lifecycle ---------------- */

    onMounted(() => {
      initTheme();
      initObservers();
      initScrollReveals();
      initCursor();
      initMagneticButtons();
      initCardTilt();
      initHeroParallax();
      initHeroScene();
      initParticlesBg();
      initScrambleTitles();
      initProjectsRail();
      runBoot();
      nextTick(moveSkillsIndicator);
      window.addEventListener('resize', moveSkillsIndicator);
      
      // Keyboard navigation: Escape closes game modal
      window.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && activeGame.value) closeGame();
      });

      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          if(href === '#' || !href) return;
          const target = document.querySelector(href);
          if(target){
            e.preventDefault();
            menuOpen.value = false; // Close mobile menu if open
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Update URL without jumping
            history.pushState(null, '', href);
          }
        });
      });
    });

    return {
      navLinks, stats, skillGroups, projects,
      booted, bootProgress,
      scrolled, menuOpen, activeSection, scrollProgress,
      activeGame, gameCanvas, openGame, closeGame,
      isMobile, screenW, screenH,
      activeSkillIndex, setSkillsTabRef, skillsIndicator,
      searchQuery, activeTags, allTags, filteredProjects, toggleTag,
      heroCanvas, railFill,
      isDark, toggleTheme,
      avatarLoaded,
    };
  },
}).mount('#app');
