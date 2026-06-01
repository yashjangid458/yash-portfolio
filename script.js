/* ==========================================
   Yash Jangid Bento Portfolio - Core Logic
   ========================================== */

function bootstrapPortfolio() {
  const initializers = [
    { name: 'BootLoader', fn: initBootLoader },
    { name: 'ParticleBackground', fn: initParticleBackground },
    { name: '3DDeckRouter', fn: init3DDeckRouter },
    { name: '3DTiltEffect', fn: init3DTiltEffect },
    { name: 'BentoChatAgent', fn: initBentoChatAgent },
    { name: 'CursorGlow', fn: initCursorGlow },
    { name: 'AudioSynthesizer', fn: initAudioSynthesizer },
    { name: 'DynamicFooterYear', fn: initDynamicFooterYear }
  ];
  
  initializers.forEach(item => {
    try {
      item.fn();
    } catch (err) {
      console.warn(`[WARN] Portfolio initializer '${item.name}' failed:`, err);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapPortfolio);
} else {
  bootstrapPortfolio();
}

/* ==========================================
   1. NEURAL PARTICLE CANVAS BACKGROUND
   ========================================== */
function initParticleBackground() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  const particles = [];
  const particleCount = Math.min(60, Math.floor((width * height) / 25000));
  const connectionDistance = 120;
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? '#8b5cf6' : '#06b6d4';
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    
    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ==========================================
   2. 3D DECK ROUTER & TRANSITIONS
   ========================================== */
function init3DDeckRouter() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.panel');
  const panelOrder = ['home', 'skills', 'experience', 'projects', 'contact'];
  
  // Quick-link button on home page
  const exploreBtn = document.getElementById('home-view-projects');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      navigateToPanel('projects');
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanel = btn.getAttribute('data-panel');
      navigateToPanel(targetPanel);
    });
  });

  function navigateToPanel(targetName) {
    const activeIndex = panelOrder.indexOf(document.querySelector('.panel.active').id.replace('panel-', ''));
    const targetIndex = panelOrder.indexOf(targetName);
    
    if (activeIndex === targetIndex) return;

    // Play high-fidelity Synthesizer transition Whoosh Sound
    playTransitionSFX();

    // Update active nav state
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-panel') === targetName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update 3D bento grids classes
    panels.forEach(panel => {
      const panelName = panel.id.replace('panel-', '');
      const panelIndex = panelOrder.indexOf(panelName);

      // Reset clean state
      panel.className = 'panel';

      if (panelIndex === targetIndex) {
        panel.classList.add('active');
      } else if (panelIndex < targetIndex) {
        if (panelIndex === targetIndex - 1) {
          panel.classList.add('prev');
        } else {
          panel.classList.add('hidden-left');
        }
      } else {
        if (panelIndex === targetIndex + 1) {
          panel.classList.add('next');
        } else {
          panel.classList.add('hidden-right');
        }
      }
    });
  }
}

/* ==========================================
   3. 3D MOUSE PARALLAX TILT EFFECT
   ========================================== */
function init3DTiltEffect() {
  const cards = document.querySelectorAll('.bento-card, .skills-card, .timeline-content, .project-card, .skills-ide-wrapper');
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) return; // Disable tilt on mobile for performance

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation offset (max 4 degrees tilt)
      const rotateX = ((centerY - y) / centerY) * 4;
      const rotateY = ((x - centerX) / centerX) * 4;
      
      card.style.setProperty('--card-tilt-x', `${rotateX}deg`);
      card.style.setProperty('--card-tilt-y', `${rotateY}deg`);
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--card-tilt-x', '0deg');
      card.style.setProperty('--card-tilt-y', '0deg');
    });
  });
}

/* ==========================================
   4. INTERACTIVE PROJECT TERMINAL SIMULATORS
   ========================================== */
let pdfSimRunning = false;
let reviewerSimRunning = false;

window.explainPdfSystem = function() {
  if (pdfSimRunning) return;
  pdfSimRunning = true;
  
  playClickSFX();
  const logsEl = document.getElementById('logs-pdf');
  logsEl.innerHTML = '';
  
  const steps = [
    { text: '[INIT] Bootstrapping Stateful Multi-Node Agent Ingestion. Source: LlamaParse Parser Engine.', delay: 300 },
    { text: '   -> Objective: Semantic element division & structural markdown extraction.', delay: 250 },
    { text: '   -> Status: Document sliced into hierarchical text sections and tables successfully.', delay: 250 },
    
    { text: '[EMBED] Initializing Vector Space Tokenization via OpenAI \'text-embedding-3-small\'.', delay: 400 },
    { text: '   -> Configuration: dimensions=1536, distance_metric=cosine_similarity.', delay: 250 },
    { text: '   -> Vector Store: Transmitted batch payloads securely to Supabase Postgres (pgvector).', delay: 300 },
    
    { text: '[ROUTER] Instantiating LangGraph Orchestration State Router & Checkpointer.', delay: 400 },
    { text: '   -> Routing Nodes: [CategorizeQuery] -> [DirectLLMResponse] or [RetrieveSupabaseContext] -> [SynthesizeAnswer].', delay: 300 },
    { text: '   -> Persistence: PostgresSaver checkpointer enabled to manage multi-turn conversation memory.', delay: 300 },
    
    { text: '[VERIFIED] Deep architecture audit complete. Yash\'s PDF system is enterprise-ready, enabling seamless multi-turn RAG conversation streams with full state persistence.', delay: 400, class: 'log-success' }
  ];
  
  let i = 0;
  function executeNext() {
    if (i < steps.length) {
      const step = steps[i];
      const p = document.createElement('div');
      if (step.class) p.className = step.class;
      p.innerHTML = `<span class="log-prompt">></span> ${step.text}`;
      logsEl.appendChild(p);
      logsEl.scrollTop = logsEl.scrollHeight;
      
      playKeyboardSFX();
      
      i++;
      setTimeout(executeNext, step.delay);
    } else {
      pdfSimRunning = false;
    }
  }
  executeNext();

  // Open Explainer Modal
  setTimeout(() => {
    window.openProjectModal(
      "Agentic PDF System // Tech Specs",
      `<h3>Agentic PDF Analysis System</h3>
       <p>An enterprise-grade, multi-node retrieval graph system designed to ingest, parse, and answer inquiries dynamically from large documents using a persistent, stateful multi-turn conversation pipeline.</p>
       
       <h4>Core Architecture & Workflow</h4>
       <ul>
         <li><strong>Advanced Ingestion Parsing</strong>: Utilizes <strong>LlamaParse</strong> to perform semantic layout analysis, cleanly segmenting structured paragraphs, dynamic headers, and embedded spreadsheet tables into unified markdown text nodes.</li>
         <li><strong>Vector Space Tokenization</strong>: Connects with the OpenAI API using <strong>text-embedding-3-small</strong> (1536-dimensional embeddings) to index document chunks into a secure <strong>Supabase (PostgreSQL) vector space</strong> running the pgvector extension.</li>
         <li><strong>Stateful Graph Routing</strong>: Implements <strong>LangGraph</strong> to choreograph a dynamic state router. User queries are routed automatically: standard prompts receive direct LLM feedback, while technical queries undergo semantic RAG vector lookups.</li>
         <li><strong>Checkpointer Database Memory</strong>: Employs a custom <strong>PostgresSaver</strong> state checkpointer, preserving complex, persistent conversation memory histories across multiple client sessions.</li>
       </ul>
       
       <h4>Technical Deliverables & Frontend Integration</h4>
       <p>The backend is built as an OOP-compliant, highly modular Python REST API that streams chunked responses in real time. It is fully integrated with a modern <strong>Next.js</strong> dashboard frontend, offering lightning-fast loads, robust authorization routing, and comprehensive diagnostic reporting.</p>
       
       <h4>Technology Stack</h4>
       <div class="modal-tech-tags">
         <span class="modal-tech-tag">Python</span>
         <span class="modal-tech-tag">LangGraph</span>
         <span class="modal-tech-tag">LangChain</span>
         <span class="modal-tech-tag">Supabase</span>
         <span class="modal-tech-tag">PostgreSQL (pgvector)</span>
         <span class="modal-tech-tag">Next.js</span>
         <span class="modal-tech-tag">OpenAI API</span>
       </div>`
    );
  }, 200);
};

window.explainReviewSystem = function() {
  if (reviewerSimRunning) return;
  reviewerSimRunning = true;
  
  playClickSFX();
  const logsEl = document.getElementById('logs-reviewer');
  logsEl.innerHTML = '';
  
  const steps = [
    { text: '[TRIGGER] CI/CD Pipeline listener triggered via GitHub webhook hook: \'pull_request.opened\'.', delay: 300 },
    { text: '   -> Action Runner: Ubuntu-latest Virtual Environment on GitHub-hosted runners.', delay: 250 },
    { text: '   -> Target: Parsing changed files and isolating modified Python modules using git-diff.', delay: 300 },
    
    { text: '[AUDIT] Launching AI Code Reviewer. Orchestrated by Yash\'s custom Python engine.', delay: 400 },
    { text: '   -> Code Quality: Linting files for structural OOP integrity, typing compliance, and nesting depth.', delay: 300 },
    { text: '   -> LLM Review: OpenAI analysis identifying redundant code paths and generating optimized suggestions.', delay: 300 },
    
    { text: '[SECURITY] Executing Data Governance & Regulatory compliance scanners.', delay: 350 },
    { text: '   -> Scan Status: Zero exposed credentials/API keys. Noise-filtering \'Quiet Mode\' flag enabled.', delay: 250 },
    { text: '   -> Action: Injecting structured review comments directly to developer threads with complete logic.', delay: 300 },
    
    { text: '[VERIFIED] Continuous integration checks validated. System ensures full codebase integrity, enforcing strict typing, security audits, and styling guidelines cleanly on every merge request.', delay: 400, class: 'log-success' }
  ];
  
  let i = 0;
  function executeNext() {
    if (i < steps.length) {
      const step = steps[i];
      const p = document.createElement('div');
      if (step.class) p.className = step.class;
      p.innerHTML = `<span class="log-prompt">></span> ${step.text}`;
      logsEl.appendChild(p);
      logsEl.scrollTop = logsEl.scrollHeight;
      
      playKeyboardSFX();
      
      i++;
      setTimeout(executeNext, step.delay);
    } else {
      reviewerSimRunning = false;
    }
  }
  executeNext();

  // Open Explainer Modal
  setTimeout(() => {
    window.openProjectModal(
      "GitHub PR Auditor // Specs",
      `<h3>AI-Powered GitHub Code Reviewer</h3>
       <p>An automated continuous integration (CI/CD) GitHub Action that listens to pull request hooks, performs rigorous code quality and compliance audits using the OpenAI API, and injects actionable code proposals directly into commits.</p>
       
       <h4>Core Architecture & Workflow</h4>
       <ul>
         <li><strong>Action Hook Webhooks</strong>: Triggered securely on <code>pull_request.opened</code> and <code>pull_request.synchronize</code> events in GitHub Actions. Runs inside clean, isolated Linux virtual environments.</li>
         <li><strong>Git Diffs Filtering</strong>: Automatically parses repository file changes using <code>git-diff</code> to extract modified modules, ignoring compiled binaries or assets to conserve execution tokens.</li>
         <li><strong>Deep Quality Diagnostics</strong>: The core Python engine analyzes changed scripts for Object-Oriented structural integrity, strict typing compliance, computational nesting depth, and formatting guidelines.</li>
         <li><strong>Noise Filtering & Data Governance</strong>: Built with a highly customizable <strong>Quiet Mode</strong> flag that automatically filters out redundant or low-impact style notifications. Includes regex filters to ensure zero API keys or server credentials are exposed to public source control.</li>
       </ul>
       
       <h4>CI/CD Automation Loop</h4>
       <p>When issues are detected, the action automatically posts structured, detailed code suggestions as inline pull request comments, enabling developers to commit proposed changes with a single click inside GitHub's UI.</p>
       
       <h4>Technology Stack</h4>
       <div class="modal-tech-tags">
         <span class="modal-tech-tag">Python</span>
         <span class="modal-tech-tag">OpenAI API</span>
         <span class="modal-tech-tag">GitHub Actions</span>
         <span class="modal-tech-tag">Git / CI-CD</span>
         <span class="modal-tech-tag">Data Security Scanners</span>
       </div>`
    );
  }, 200);
};

window.openProjectModal = function(title, bodyHtml) {
  const modal = document.getElementById('project-modal');
  const titleEl = document.getElementById('modal-project-title');
  const bodyEl = document.getElementById('modal-project-body');
  
  if (!modal || !titleEl || !bodyEl) return;
  
  titleEl.innerText = title;
  bodyEl.innerHTML = bodyHtml;
  
  modal.classList.add('active');
  playTransitionSFX(); // Play custom synthesiser transition whoosh sweep!
};

window.closeProjectModal = function(event) {
  if (event) event.preventDefault();
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  
  modal.classList.remove('active');
  playClickSFX(); // Play clean key click audio clip!
};

/* ==========================================
   5. BENTO EMBEDDED CHATBOT AGENT (LOCAL RAG)
   ========================================== */
let chatBotTyping = false;

const resumeKnowledge = {
  greetings: "Hi there! I am Yash's AI Assistant, pre-loaded with details of his professional background, projects, and skillset. How can I help you today? You can ask me about his Agentic PDF System, his AI GitHub Reviewer, his skills, or how to contact him directly!",
  about: "Yash Jangid is an AI/ML Engineer & Python Developer currently pursuing his B.Tech. in AI & ML at BIT Mesra. He specializes in stateful agentic pipelines, RAG systems (LangGraph/LangChain), vector stores (Supabase/PostgreSQL), and backend engineering. Check his profile: https://github.com/yashjangid458",
  pdf: "The Agentic PDF Analysis System is Yash's flagship LangGraph build. It manages ingestion, parses massive PDFs dynamically via LlamaParse, feeds embeddings into Supabase (PostgreSQL), and uses multi-node routing to answer queries via persistent multi-turn conversations. Check it out on GitHub: https://github.com/yashjangid458/project-1-ai-pdf-chatbot-langchain-main",
  reviewer: "Yash built an AI-Powered GitHub Code Reviewer Action that automatically parses pull request diffs, reviews OOP integrity and typing structures via the OpenAI API, and posts structured feedback. Check it out on GitHub: https://github.com/yashjangid458/project-2-openai-pr-reviewer-main",
  projects: "Yash has built notable AI systems including:<br>1. **Agentic PDF Analysis System**: A LangGraph stateful multi-node RAG pipeline. Repo: https://github.com/yashjangid458/project-1-ai-pdf-chatbot-langchain-main<br>2. **AI-Powered GitHub Code Reviewer**: An automated CI/CD action reviewing PR diffs securely. Repo: https://github.com/yashjangid458/project-2-openai-pr-reviewer-main<br>Check out his full work at https://github.com/yashjangid458 !",
  skills: "Yash specializes heavily in Python, LangChain, LangGraph, Retrieval-Augmented Generation (RAG), OpenAI API, Vector Databases (Supabase, PostgreSQL), Next.js, and CI/CD pipelines (GitHub Actions).",
  work: "As an Independent AI/ML Developer, Yash architected stateful RAG pipelines, integrated Next.js frontends with Python REST APIs using OOP, and automated codebase audits using custom GitHub Actions backed by the OpenAI SDK.",
  open: "Yes, Yash Jangid is absolutely open to internships, freelance projects, and remote AI/ML Engineer / Python Developer roles. You can contact him at yashjangid458@gmail.com, see his GitHub at https://github.com/yashjangid458 or call +91-7014695677.",
  edu: "Yash is currently pursuing a B.Tech. in Artificial Intelligence and Machine Learning at BIT Mesra, Ranchi, India (2023 - Present) with solid expertise in DSA, DBMS, and Machine Learning architectures.",
  default: "I understand! Yash Jangid specializes in stateful AI agents, RAG, and clean Python backend engineering. To collaborate, check his Contact panel, view his GitHub (https://github.com/yashjangid458) or email directly at yashjangid458@gmail.com."
};

function initBentoChatAgent() {
  // Silent initializer since Chatbot is now embedded in grid layout
}

window.sendBentoSuggested = function(text) {
  if (chatBotTyping) return;
  const input = document.getElementById('bento-chat-input');
  if (input) {
    input.value = text;
    sendBentoUserMsg();
  }
};

window.sendBentoUserMsg = function() {
  if (chatBotTyping) return;
  
  const input = document.getElementById('bento-chat-input');
  const logs = document.getElementById('bento-chat-logs');
  const sendBtn = document.querySelector('.chatbot-send-btn');
  if (!input || !logs || !input.value.trim()) return;
  
  const text = input.value.trim();
  input.value = '';
  
  chatBotTyping = true;
  input.disabled = true;
  if (sendBtn) sendBtn.disabled = true;
  
  playClickSFX();

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'bento-msg outgoing';
  userMsg.innerHTML = `${text}`;
  logs.appendChild(userMsg);
  logs.scrollTop = logs.scrollHeight;
  
  // Determine matching answer
  let responseText = resumeKnowledge.default;
  const normalized = text.toLowerCase().trim();
  
  if (normalized === 'hi' || normalized === 'hello' || normalized === 'hey' || normalized.startsWith('hello') || normalized.startsWith('hi ') || normalized.startsWith('hey ') || normalized.startsWith('yo ') || normalized === 'yo') {
    responseText = resumeKnowledge.greetings;
  } else if (normalized.includes('pdf') || normalized.includes('agentic pdf') || normalized.includes('analysis')) {
    responseText = resumeKnowledge.pdf;
  } else if (normalized.includes('reviewer') || normalized.includes('github reviewer') || normalized.includes('pr audit')) {
    responseText = resumeKnowledge.reviewer;
  } else if (normalized.includes('projects') || normalized.includes('project') || normalized.includes('portfolio') || normalized.includes('build')) {
    responseText = resumeKnowledge.projects;
  } else if (normalized.includes('who is') || normalized.includes('who are you') || normalized.includes('about yash') || normalized.includes('yash jangid') || normalized.includes('yash')) {
    responseText = resumeKnowledge.about;
  } else if (normalized.includes('skill') || normalized.includes('stack') || normalized.includes('language') || normalized.includes('technolog')) {
    responseText = resumeKnowledge.skills;
  } else if (normalized.includes('work') || normalized.includes('experience') || normalized.includes('history') || normalized.includes('job') || normalized.includes('intern')) {
    responseText = resumeKnowledge.work;
  } else if (normalized.includes('open') || normalized.includes('hire') || normalized.includes('remote') || normalized.includes('contact') || normalized.includes('email') || normalized.includes('call') || normalized.includes('phone')) {
    responseText = resumeKnowledge.open;
  } else if (normalized.includes('edu') || normalized.includes('college') || normalized.includes('study') || normalized.includes('bit') || normalized.includes('mesra') || normalized.includes('degree')) {
    responseText = resumeKnowledge.edu;
  }
  
  // Typing simulation delay
  setTimeout(() => {
    const aiMsg = document.createElement('div');
    aiMsg.className = 'bento-msg incoming';
    logs.appendChild(aiMsg);
    
    let index = 0;
    function typeChar() {
      if (index < responseText.length) {
        const partialText = responseText.substring(0, index + 1);
        aiMsg.innerHTML = partialText
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" class="chat-link">$1</a>');
        logs.scrollTop = logs.scrollHeight;
        
        playKeyboardSFX();

        index++;
        setTimeout(typeChar, 12);
      } else {
        chatBotTyping = false;
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        if (window.innerWidth > 768) {
          input.focus();
        }
      }
    }
    typeChar();
    
  }, 500);
};

/* ==========================================
   6. DYNAMIC SPOTLIGHT CURSOR FOLLOWER
   ========================================== */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  const isMobile = window.innerWidth <= 768;
  if (!glow || isMobile) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function updatePosition() {
    const dx = mouseX - glowX;
    const dy = mouseY - glowY;
    
    // Smooth LERP motion (linear interpolation)
    glowX += dx * 0.08;
    glowY += dy * 0.08;
    
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    
    requestAnimationFrame(updatePosition);
  }
  
  updatePosition();
}

/* ==========================================
   7. AUTOMATED TERMINAL BOOT LOADER SEQUENCE
   ========================================== */
function initBootLoader() {
  const bootLogs = document.getElementById('boot-logs');
  const bootLoader = document.getElementById('boot-loader');
  if (!bootLogs || !bootLoader) return;
  
  // Clear HTML loading placeholder
  bootLogs.innerHTML = '';
  
  const diagnosticLogs = [
    { text: '>> Diagnostic sequence triggered // Yash AI core initialized', delay: 100 },
    { text: '>> INITIALIZING SECURE PERSPECTIVE BENTO GRIDS ENGINE...', delay: 180 },
    { text: '>> LOADED 3D ROTATIONAL CAROUSEL VIEWPORTS (OK)', delay: 140 },
    { text: '>> VERIFYING AGENTIC RESUME INGESTION SPECIFICATIONS...', delay: 240 },
    { text: '>> CORE STACK DETECTED: [Python, LangGraph, Supabase, RAG]', delay: 200, class: 'blue' },
    { text: '>> ACTIVE AGENTS: PDF Analysis System & Pull-Request Code Auditor', delay: 150, class: 'purple' },
    { text: '>> INJECTING SYNTHESIZED ZERO-LATENCY WEB AUDIO MATRIX...', delay: 180 },
    { text: '>> DECRYPTING PROFESSIONAL PORTFOLIO ACCESS... [100%]', delay: 160 },
    { text: '>> SUCCESS. WELCOME RECRUITER. YASH_AI DEPLOYED ONLINE.', delay: 220, class: 'blue' }
  ];
  
  let i = 0;
  function printNextLog() {
    if (i < diagnosticLogs.length) {
      const log = diagnosticLogs[i];
      const p = document.createElement('div');
      p.className = 'boot-log-row';
      if (log.class) p.classList.add(log.class);
      p.innerText = log.text;
      bootLogs.appendChild(p);
      bootLogs.scrollTop = bootLogs.scrollHeight;
      i++;
      setTimeout(printNextLog, log.delay);
    } else {
      // Fade loader away
      setTimeout(() => {
        bootLoader.style.opacity = '0';
        bootLoader.style.visibility = 'hidden';
      }, 500);
    }
  }
  
  setTimeout(printNextLog, 300);
}

/* ==========================================
   8. CLIENT-SIDE WEB AUDIO SYNTHESIZER (ZERO-ASSETS)
   ========================================== */
let sfxEnabled = true;
let audioCtx = null;

function resumeAudioContext() {
  if (!sfxEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (e) {
    console.warn('[WARN] AudioContext failed to resume:', e);
  }
}

// Automatically resume AudioContext on the first interaction anywhere
document.addEventListener('click', resumeAudioContext, { once: true });
document.addEventListener('mouseenter', resumeAudioContext, { once: true });

function initAudioSynthesizer() {
  const toggleBtn = document.getElementById('sound-toggle');
  if (!toggleBtn) return;
  
  const onIcon = toggleBtn.querySelector('.sound-on-icon');
  const offIcon = toggleBtn.querySelector('.sound-off-icon');
  
  // Set initial icon display state correctly based on sfxEnabled
  if (sfxEnabled) {
    onIcon.style.display = 'block';
    offIcon.style.display = 'none';
  } else {
    onIcon.style.display = 'none';
    offIcon.style.display = 'block';
  }
  
  toggleBtn.addEventListener('click', () => {
    sfxEnabled = !sfxEnabled;
    
    if (sfxEnabled) {
      resumeAudioContext();
      onIcon.style.display = 'block';
      offIcon.style.display = 'none';
      playTransitionSFX(); // play welcome sweep
    } else {
      onIcon.style.display = 'none';
      offIcon.style.display = 'block';
    }
  });
  
  // Attach fast button hover click SFX triggers
  const hoverElements = document.querySelectorAll('.nav-btn, .btn-primary, .btn-secondary, .skills-toggle-btn, .ide-tab, .simulator-run-btn');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      playHoverSFX();
    });
  });
}

function playHoverSFX() {
  if (!sfxEnabled) return;
  resumeAudioContext();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch(e) {}
}

function playClickSFX() {
  if (!sfxEnabled) return;
  resumeAudioContext();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch(e) {}
}

function playTransitionSFX() {
  if (!sfxEnabled) return;
  resumeAudioContext();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch(e) {}
}

function playKeyboardSFX() {
  if (!sfxEnabled) return;
  resumeAudioContext();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.008, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.02);
  } catch(e) {}
}

/* ==========================================
   9. SKILLS DISPLAY TOGGLE & RESUME IDE TABS
   ========================================== */
window.toggleSkillsView = function(view) {
  const visualBtn = document.getElementById('btn-skills-visual');
  const ideBtn = document.getElementById('btn-skills-ide');
  const visualContainer = document.getElementById('skills-visual-container');
  const ideContainer = document.getElementById('skills-ide-container');
  
  if (!visualBtn || !ideBtn || !visualContainer || !ideContainer) return;
  
  playClickSFX();
  
  if (view === 'visual') {
    visualBtn.classList.add('active');
    ideBtn.classList.remove('active');
    visualContainer.style.display = 'grid';
    ideContainer.style.display = 'none';
  } else {
    visualBtn.classList.remove('active');
    ideBtn.classList.add('active');
    visualContainer.style.display = 'none';
    ideContainer.style.display = 'flex';
  }
};

window.switchIdeTab = function(tab) {
  const tabs = document.querySelectorAll('.ide-tab');
  const codeBlocks = document.querySelectorAll('.ide-code');
  
  playClickSFX();
  
  tabs.forEach(t => {
    if (t.id === `tab-${tab}`) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });
  
  codeBlocks.forEach(block => {
    if (block.id === `code-${tab}`) {
      block.classList.add('active');
      block.style.display = 'block';
    } else {
      block.classList.remove('active');
      block.style.display = 'none';
    }
  });
};

function initDynamicFooterYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.innerText = new Date().getFullYear();
  }
}
