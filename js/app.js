/* ==========================================================================
   ALEXANDRA PRATAP SINGH — PORTFOLIO
   Vue 3 app: content data, nav/section state, GSAP scroll orchestration,
   boot sequence, stat counters, and the game modal bridge.
   ========================================================================== */

const { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;

createApp({
  setup(){

    /* ---------------- Content data ---------------- */

    const navLinks = [
      { id: 'about',     label: 'Me'        },
      { id: 'skills',    label: 'Power-ups' },
      { id: 'projects',  label: 'Quests'    },
      { id: 'simulator', label: 'Arcade'    },
      { id: 'contact',   label: 'Contact'   },
    ];

    const worldNames = {
      hero: 'START', about: 'LEVEL 1', skills: 'LEVEL 2',
      projects: 'LEVEL 3', simulator: 'BONUS', contact: 'FINISH',
    };

    const skillIcons = ['\u{1F9E0}', '\u{1F4CA}', '\u{1F5C4}\uFE0F', '\u2699\uFE0F', '\u2728', '\u{1F3A8}'];

    const stats = [
      { value: '14+',   label: 'Projects shipped' },
      { value: '90%',   label: 'Best model accuracy' },
      { value: '60%',   label: 'Faster resume review' },
      { value: 'Top 5', label: 'of 198 teams, UHACK 3.0' },
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
        code: 'API.05', title: 'Backend & APIs',
        tools: ['FastAPI', 'PostgreSQL', 'Redis', 'Celery', 'Docker', 'JWT'],
      },
      {
        code: 'GENAI.06', title: 'Retrieval & LLM Systems',
        tools: ['RAG', 'pgvector', 'fastembed / ONNX', 'Prompt Engineering', 'Precision@k / MRR'],
      },
      {
        code: 'WEB.04', title: 'Web & Tooling',
        tools: ['HTML', 'CSS', 'JavaScript', 'VS Code', 'Google Colab'],
      },
    ];

    const projects = [
      {
        name: 'RAG Pipeline',
        tagline: 'Retrieval-augmented generation built from scratch, no framework',
        desc: 'Upload, parse, clean, chunk, embed locally (fastembed/ONNX, bge-small) and index in Postgres + pgvector, then answer questions with cited, verified LLM responses. Evaluated on a frozen 30-question set with Precision@k, Recall@k and MRR, plus a 9-run chunk_size x top_k grid search. Ships with a live chunk-lab UI.',
        tags: ['Python', 'FastAPI', 'pgvector', 'RAG', 'Docker'],
        metric: '60', metricLabel: 'Tests — No API Key Needed',
        url: 'https://github.com/alexandra272003/Rag_Pipeline',
      },
      {
        name: 'Streaming Chatbot',
        tagline: 'One chat core, three delivery modes: HTTP, SSE, WebSocket',
        desc: 'Async FastAPI chat backend with PostgreSQL persistence and an OpenAI-compatible LLM (built against Groq). Retry/backoff for provider failures and rolling summarization to stop conversations growing unbounded.',
        tags: ['Python', 'FastAPI', 'PostgreSQL', 'WebSocket', 'Docker'],
        metric: '3', metricLabel: 'Delivery Modes, One Core',
        url: 'https://github.com/alexandra272003/Streaming-Chatbot',
      },
      {
        name: 'SuperBrowser',
        tagline: 'AI-native browser with per-tab search memory',
        desc: 'Open-source contribution (GSSoC) to a multi-engine search aggregator with context-aware AI that remembers what you searched per tab. React 19 + Vite frontend, FastAPI backend, shipped as web and desktop apps.',
        tags: ['React', 'FastAPI', 'Vite', 'Open Source'],
        metric: 'GSSoC', metricLabel: 'Open Source Contribution',
        url: 'https://github.com/PandyaJeet/SuperBrowser',
      },
      {
        name: 'Shopping API',
        tagline: 'E-commerce backend that cannot oversell',
        desc: 'FastAPI + PostgreSQL store backend with atomic stock decrements, backed by a concurrency test proving stock never goes negative under parallel orders.',
        tags: ['Python', 'FastAPI', 'PostgreSQL', 'Concurrency'],
        metric: '0', metricLabel: 'Oversells Under Concurrent Load',
        url: 'https://github.com/alexandra272003?tab=repositories',
      },
      {
        name: 'Secure API',
        tagline: 'JWT auth, rate limiting and background workers',
        desc: 'FastAPI service with JWT authentication, Redis-backed rate limiting and Celery background workers, orchestrated as a four-service Docker Compose stack.',
        tags: ['Python', 'FastAPI', 'Redis', 'Celery', 'JWT', 'Docker'],
        metric: '4', metricLabel: 'Services in Docker Compose',
        url: 'https://github.com/alexandra272003?tab=repositories',
      },
      {
        name: 'Ping / User API',
        tagline: 'MongoDB CRUD with verified indexing',
        desc: 'FastAPI + MongoDB CRUD service with compound indexes, confirmed with explain() against 5,000 documents.',
        tags: ['Python', 'FastAPI', 'MongoDB', 'Indexing'],
        metric: '5k', metricLabel: 'Docs Verified with explain()',
        url: 'https://github.com/alexandra272003?tab=repositories',
      },
      {
        name: 'Dog Vision',
        tagline: 'Transfer-learning image classifier for 120 dog breeds',
        desc: 'End-to-end computer vision pipeline: MobileNetV2 transfer learning on 10,000+ images, tf.data input pipeline, TensorBoard tracking and a Kaggle submission.',
        tags: ['TensorFlow', 'MobileNetV2', 'Transfer Learning', 'Kaggle'],
        metric: '120', metricLabel: 'Dog Breeds Classified',
        url: 'https://github.com/alexandra272003?tab=repositories',
      },
      {
        name: 'StegoGraphy',
        tagline: 'Hide text, files and voice inside images',
        desc: 'Tkinter desktop app using LSB encoding with AES-256-GCM encryption and offline speech-to-text for voice payloads. Core engine is separated from the GUI and covered by automated tests.',
        tags: ['Python', 'Tkinter', 'Cryptography', 'Steganography'],
        metric: 'AES-256', metricLabel: 'GCM Encrypted Payloads',
        url: 'https://github.com/alexandra272003?tab=repositories',
      },
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

    /* ---------------- Projects search / tag filter ---------------- */

    const searchQuery = ref('');
    const activeTags = ref([]);

    // Show the 10 most common technologies as filter chips.
    const allTags = computed(() => {
      const counts = {};
      projects.forEach((p) => p.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
      return Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))
        .slice(0, 10);
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

    function clearFilters(){
      searchQuery.value = '';
      activeTags.value = [];
    }

    /* ---------------- HUD / nav state ---------------- */

    const menuOpen = ref(false);
    const activeSection = ref('hero');
    const sectionIds = ['hero', 'about', 'skills', 'projects', 'simulator', 'contact'];
    const worldLabel = computed(() => worldNames[activeSection.value] || 'START');

    function initObservers(){
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

    /* ---------------- Hidden secrets ---------------- */

    const SECRETS_KEY = 'aps_portfolio_secrets_v3';
    const secrets = [
      { id: 'photo',  label: 'Say cheese',            hint: 'Something is hiding around the photo frame at the top.' },
      { id: 'logo',   label: 'Logo tapper',           hint: 'Tap the APS logo three times, fast.' },
      { id: 'candy',  label: 'Candy in the notebook', hint: 'Something sweet is stuck in the About notebook.' },
      { id: 'cookie', label: 'Cookie crumb',          hint: 'Power-ups section, near the top right.' },
      { id: 'gem',    label: 'Shiny gem',             hint: 'Below the project cards, bottom left.' },
      { id: 'ghost',  label: 'Arcade ghost',          hint: 'The Arcade is haunted, bottom right.' },
      { id: 'door',   label: 'Tiny door',             hint: 'Scroll all the way to the footer.' },
    ];
    const found = ref([]);
    const toast = ref('');
    const showWin = ref(false);
    const showList = ref(false);
    const allFound = computed(() => found.value.length === secrets.length);
    let toastTimer = null;
    let logoTaps = 0;
    let logoTimer = null;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PAINT = ['#FF6FA5', '#6FD3FF', '#FFD84D', '#7CE3B6', '#B28CFF', '#FF9F5A'];

    function say(msg, ms){
      toast.value = msg;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.value = ''; }, ms || 2800);
    }

    function burstConfetti(x, y, n){
      if(window.Confetti) window.Confetti.burst(x, y, n);
    }

    function sprinkleStorm(){
      if(window.Sprinkles) window.Sprinkles.storm();
      if(window.Confetti) window.Confetti.rain(120);
    }

    function findSecret(id, ev){
      const el = ev && ev.currentTarget;
      if(el){
        const r = el.getBoundingClientRect();
        burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 80);
        el.classList.add('is-found');
      }
      if(found.value.includes(id)){ say('You already found that one!'); return; }
      found.value.push(id);
      try { localStorage.setItem(SECRETS_KEY, JSON.stringify(found.value)); } catch (e) { /* ignore */ }
      const s = secrets.find((x) => x.id === id);
      say('Secret found: ' + (s ? s.label : id) + ' (' + found.value.length + '/' + secrets.length + ')');
      if(allFound.value) setTimeout(() => { showWin.value = true; if(window.Confetti) window.Confetti.celebrate(); }, 700);
    }

    function resetSecrets(){
      found.value = [];
      try { localStorage.removeItem(SECRETS_KEY); } catch (e) { /* ignore */ }
      document.querySelectorAll('.secret.is-found').forEach((el) => el.classList.remove('is-found'));
      say('Progress reset. Happy hunting!');
    }

    function tapLogo(){
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      logoTaps++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoTaps = 0; }, 1200);
      if(logoTaps >= 3){
        logoTaps = 0;
        findSecret('logo', { currentTarget: document.querySelector('.logo') });
      }
    }

    function initKonami(){
      const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      let pos = 0;
      window.addEventListener('keydown', (e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        pos = key === code[pos] ? pos + 1 : (key === code[0] ? 1 : 0);
        if(pos === code.length){ pos = 0; sprinkleStorm(); say('Konami code! Sprinkle storm!'); }
      });
    }

    function loadSecrets(){
      try {
        const saved = JSON.parse(localStorage.getItem(SECRETS_KEY) || '[]');
        found.value = saved.filter((id) => secrets.some((s) => s.id === id));
      } catch (e) { found.value = []; }
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
      loadSecrets();
      if(window.Sprinkles) window.Sprinkles.init();
      initObservers();
      initKonami();
      // One gentle nudge per visit so people know the hunt exists.
      setTimeout(() => {
        try {
          if(found.value.length === 0 && !sessionStorage.getItem('aps_hint_shown')){
            sessionStorage.setItem('aps_hint_shown', '1');
            say('Psst! 7 secrets are hiding on this page. Tap the candy counter for hints.', 5000);
          }
        } catch (e) { /* ignore */ }
      }, 4500);
      window.addEventListener('keydown', (e) => {
        if(e.key !== 'Escape') return;
        if(activeGame.value) closeGame();
        else if(showWin.value) showWin.value = false;
        else if(showList.value) showList.value = false;
      });
      // Keep found secrets visible after a reload.
      nextTick(() => {
        const map = { photo: '.secret--photo', candy: '.secret--candy', cookie: '.secret--cookie', gem: '.secret--gem', ghost: '.secret--ghost', door: '.secret--door' };
        found.value.forEach((id) => { const el = map[id] && document.querySelector(map[id]); if(el) el.classList.add('is-found'); });
      });
    });

    return {
      navLinks, stats, skillGroups, skillIcons, projects,
      menuOpen, activeSection, worldLabel,
      secrets, found, allFound, toast, showWin, showList, findSecret, tapLogo, resetSecrets,
      activeGame, gameCanvas, openGame, closeGame, isMobile, screenW, screenH,
      searchQuery, activeTags, allTags, filteredProjects, toggleTag, clearFilters,
    };
  },
}).mount('#app');
