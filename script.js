const templateData = [
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Calm spacing, refined hierarchy',
    accent: 'linear-gradient(135deg, rgba(139,92,246,0.95), rgba(56,189,248,0.82))',
    glow: 'rgba(139,92,246,0.32)',
    style: 'editorial'
  },
  {
    id: 'creative',
    name: 'Creative',
    tagline: 'Bold cards with expressive motion',
    accent: 'linear-gradient(135deg, rgba(244,114,182,0.94), rgba(139,92,246,0.82))',
    glow: 'rgba(244,114,182,0.3)',
    style: 'artful'
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Clean sections for credibility and trust',
    accent: 'linear-gradient(135deg, rgba(52,211,153,0.92), rgba(56,189,248,0.84))',
    glow: 'rgba(56,189,248,0.3)',
    style: 'corporate'
  }
];

const typingWords = ['Developers', 'Designers', 'Students', 'Founders', 'Freelancers'];
const storageKey = 'portifyStudioPortfolioHistory';
const draftKey = 'portifyStudioDraft';

const appState = {
  activeStep: 0,
  selectedTemplate: templateData[0].id,
  skills: ['Figma', 'React', 'JavaScript'],
  projects: [createProjectItem(), createProjectItem()],
  profileImage: '',
  generatedPortfolio: null,
  history: loadHistory()
};

const elements = {
  navbar: document.getElementById('navbar'),
  mobileToggle: document.getElementById('mobileToggle'),
  navLinks: document.getElementById('navLinks'),
  templateGrid: document.getElementById('templateGrid'),
  form: document.getElementById('portfolioForm'),
  stepLabel: document.getElementById('stepLabel'),
  stepName: document.getElementById('stepName'),
  progressFill: document.getElementById('progressFill'),
  formSteps: Array.from(document.querySelectorAll('.form-step')),
  prevStep: document.getElementById('prevStep'),
  nextStep: document.getElementById('nextStep'),
  generateBtn: document.getElementById('generateBtn'),
  saveDraftBtn: document.getElementById('saveDraftBtn'),
  skillInput: document.getElementById('skillInput'),
  addSkillBtn: document.getElementById('addSkillBtn'),
  skillTags: document.getElementById('skillTags'),
  projectsContainer: document.getElementById('projectsContainer'),
  addProjectBtn: document.getElementById('addProjectBtn'),
  profileImage: document.getElementById('profileImage'),
  imagePreview: document.getElementById('imagePreview'),
  outputSection: document.getElementById('outputSection'),
  portfolioPreview: document.getElementById('portfolioPreview'),
  printBtn: document.getElementById('printBtn'),
  editAgainBtn: document.getElementById('editAgainBtn'),
  historyGrid: document.getElementById('historyGrid'),
  toast: document.getElementById('toast'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  typingText: document.getElementById('typingText'),
  particleField: document.getElementById('particleField'),
  cursorGlow: document.getElementById('cursorGlow')
};

let lastStepDirection = 'forward';

function createProjectItem() {
  return {
    title: '',
    description: '',
    link: ''
  };
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch {
    return [];
  }
}

function persistHistory() {
  localStorage.setItem(storageKey, JSON.stringify(appState.history));
}

function saveDraft() {
  const draft = collectFormData();
  localStorage.setItem(draftKey, JSON.stringify({
    ...draft,
    selectedTemplate: appState.selectedTemplate,
    activeStep: appState.activeStep,
    skills: appState.skills,
    profileImage: appState.profileImage,
    projects: appState.projects
  }));
  showToast('Draft saved locally.');
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    const draft = JSON.parse(raw);
    setFieldValue('name', draft.name || '');
    setFieldValue('title', draft.title || '');
    setFieldValue('bio', draft.bio || '');
    setFieldValue('email', draft.email || '');
    setFieldValue('linkedin', draft.linkedin || '');
    setFieldValue('github', draft.github || '');
    if (draft.profileImage) {
      appState.profileImage = draft.profileImage;
      renderImagePreview(draft.profileImage);
    }
    if (Array.isArray(draft.skills) && draft.skills.length) {
      appState.skills = draft.skills;
    }
    if (Array.isArray(draft.projects) && draft.projects.length) {
      appState.projects = draft.projects;
    }
    if (draft.selectedTemplate) {
      appState.selectedTemplate = draft.selectedTemplate;
    }
    if (typeof draft.activeStep === 'number') {
      appState.activeStep = draft.activeStep;
    }
  } catch {
    showToast('Draft could not be restored.');
  }
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (field) {
    field.value = value;
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove('show'), 2600);
}

function createParticles() {
  const particleCount = 42;
  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    const size = 1.6 + Math.random() * 4.8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 110}%`;
    particle.style.opacity = String(0.3 + Math.random() * 0.5);
    particle.style.animationDuration = `${10 + Math.random() * 16}s`;
    particle.style.animationDelay = `${Math.random() * 12}s`;
    particle.style.transform = `translate3d(${(Math.random() - 0.5) * 20}px, 0, 0)`;
    elements.particleField.appendChild(particle);
  }
}

function renderTemplates() {
  elements.templateGrid.innerHTML = templateData.map((template) => `
    <article class="template-card glass" data-template="${template.id}">
      <div class="template-preview">
        <div class="template-preview-inner">
          <div class="template-mini-bar" style="background:${template.accent}"></div>
          <div class="template-mini-card"></div>
        </div>
      </div>
      <span class="template-badge">${template.style}</span>
      <h3>${template.name}</h3>
      <p>${template.tagline}</p>
      <div class="template-meta">
        <small>Premium layout</small>
        <button type="button" class="btn btn-secondary ripple select-template">Select Template</button>
      </div>
    </article>
  `).join('');

  elements.templateGrid.querySelectorAll('.template-card').forEach((card) => {
    const templateId = card.dataset.template;
    const selectButton = card.querySelector('.select-template');
    if (templateId === appState.selectedTemplate) {
      card.style.boxShadow = `0 0 0 1px ${templateData.find((item) => item.id === templateId).glow} inset, 0 24px 48px rgba(139, 92, 246, 0.22)`;
    }
    selectButton.addEventListener('click', () => {
      appState.selectedTemplate = templateId;
      renderTemplates();
      showToast(`${templateData.find((item) => item.id === templateId).name} template selected.`);
      document.getElementById('builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  setupFloatingMicroMotion();
}

function renderStep() {
  elements.form.classList.remove('step-forward', 'step-backward');
  elements.form.classList.add(lastStepDirection === 'backward' ? 'step-backward' : 'step-forward');

  elements.formSteps.forEach((step, index) => {
    step.classList.toggle('active', index === appState.activeStep);
  });

  const stepLabels = ['Personal Info', 'About & Skills', 'Projects', 'Contact'];
  elements.stepLabel.textContent = `Step ${appState.activeStep + 1} of ${elements.formSteps.length}`;
  elements.stepName.textContent = stepLabels[appState.activeStep];
  elements.progressFill.style.width = `${((appState.activeStep + 1) / elements.formSteps.length) * 100}%`;
  elements.prevStep.disabled = appState.activeStep === 0;
  elements.nextStep.classList.toggle('hidden', appState.activeStep === elements.formSteps.length - 1);
  elements.generateBtn.classList.toggle('hidden', appState.activeStep !== elements.formSteps.length - 1);
}

function renderSkills() {
  elements.skillTags.innerHTML = appState.skills.map((skill, index) => `
    <span class="skill-tag" data-index="${index}">
      ${skill}
      <button type="button" aria-label="Remove ${skill}">×</button>
    </span>
  `).join('');

  elements.skillTags.querySelectorAll('.skill-tag button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const tag = event.currentTarget.closest('.skill-tag');
      const index = Number(tag.dataset.index);
      appState.skills.splice(index, 1);
      renderSkills();
    });
  });
}

function renderProjects() {
  elements.projectsContainer.innerHTML = '';
  appState.projects.forEach((project, index) => {
    const template = document.getElementById('projectTemplate');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.project-card');
    const removeButton = clone.querySelector('.remove-project');
    const title = clone.querySelector('.project-title');
    const description = clone.querySelector('.project-description');
    const link = clone.querySelector('.project-link');

    title.value = project.title;
    description.value = project.description;
    link.value = project.link;

    title.addEventListener('input', (event) => {
      appState.projects[index].title = event.target.value;
    });
    description.addEventListener('input', (event) => {
      appState.projects[index].description = event.target.value;
    });
    link.addEventListener('input', (event) => {
      appState.projects[index].link = event.target.value;
    });

    removeButton.addEventListener('click', () => {
      if (appState.projects.length === 1) {
        appState.projects[0] = createProjectItem();
      } else {
        appState.projects.splice(index, 1);
      }
      renderProjects();
    });

    elements.projectsContainer.appendChild(clone);
  });
}

function addSkill(skill) {
  const value = skill.trim();
  if (!value) return;
  if (appState.skills.some((entry) => entry.toLowerCase() === value.toLowerCase())) {
    showToast('That skill already exists.');
    return;
  }
  appState.skills.push(value);
  elements.skillInput.value = '';
  renderSkills();
}

function addProject() {
  appState.projects.push(createProjectItem());
  renderProjects();
}

function renderImagePreview(source) {
  elements.imagePreview.innerHTML = source
    ? `<img src="${source}" alt="Profile preview" />`
    : '<div class="preview-placeholder">Upload an image or use the generated avatar</div>';
}

function readProfileImage(file) {
  if (!file) {
    appState.profileImage = '';
    renderImagePreview('');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    appState.profileImage = String(reader.result || '');
    renderImagePreview(appState.profileImage);
  };
  reader.readAsDataURL(file);
}

function collectFormData() {
  return {
    name: document.getElementById('name').value.trim(),
    title: document.getElementById('title').value.trim(),
    bio: document.getElementById('bio').value.trim(),
    email: document.getElementById('email').value.trim(),
    linkedin: document.getElementById('linkedin').value.trim(),
    github: document.getElementById('github').value.trim(),
    skills: [...appState.skills],
    projects: appState.projects.map((project) => ({ ...project }))
  };
}

function validateStep(stepIndex) {
  const currentStep = elements.formSteps[stepIndex];
  const inputs = Array.from(currentStep.querySelectorAll('input, textarea')).filter((input) => input.type !== 'file');
  let valid = true;

  inputs.forEach((input) => {
    if (!input.checkValidity()) {
      input.reportValidity();
      valid = false;
    }
  });

  if (stepIndex === 2) {
    const projectInputs = Array.from(currentStep.querySelectorAll('.project-title, .project-description, .project-link'));
    if (!projectInputs.length) {
      showToast('Add at least one project.');
      valid = false;
    }
  }

  return valid;
}

function nextStep() {
  if (!validateStep(appState.activeStep)) return;
  lastStepDirection = 'forward';
  appState.activeStep = Math.min(appState.activeStep + 1, elements.formSteps.length - 1);
  renderStep();
}

function previousStep() {
  lastStepDirection = 'backward';
  appState.activeStep = Math.max(appState.activeStep - 1, 0);
  renderStep();
}

function getTemplateStyle(templateId) {
  return templateData.find((template) => template.id === templateId) || templateData[0];
}

function buildPortfolioMarkup(data) {
  const template = getTemplateStyle(appState.selectedTemplate);
  const avatarMarkup = appState.profileImage
    ? `<img src="${appState.profileImage}" alt="${data.name} profile image" />`
    : `<div class="portfolio-avatar" style="display:grid;place-items:center;background:${template.accent}"><span style="font-family:Poppins,sans-serif;font-size:2rem;">${getInitials(data.name)}</span></div>`;

  return `
    <div class="portfolio-hero">
      <div class="portfolio-avatar">${appState.profileImage ? `<img src="${appState.profileImage}" alt="${data.name} profile image" />` : `<div style="width:100%;height:100%;display:grid;place-items:center;background:${template.accent};font-family:Poppins,sans-serif;font-size:2rem;">${getInitials(data.name)}</div>`}</div>
      <div class="portfolio-header">
        <span class="section-kicker">${template.name} template</span>
        <h1>${escapeHtml(data.name || 'Your Name')}</h1>
        <p class="preview-role">${escapeHtml(data.title || 'Creative Professional')}</p>
        <p class="preview-bio">${escapeHtml(data.bio || 'Share a short bio that captures your work, personality, and the impact you create.')}</p>
      </div>
    </div>

    <div class="section-block">
      <h3>Skills</h3>
      <div class="skill-badges">
        ${(data.skills.length ? data.skills : ['Strategy', 'Design', 'Development']).map((skill, index) => `<span class="skill-badge" style="animation-delay:${index * 90}ms">${escapeHtml(skill)}</span>`).join('')}
      </div>
    </div>

    <div class="section-block">
      <h3>Projects</h3>
      <div class="project-grid">
        ${(data.projects.filter((project) => project.title || project.description || project.link).length ? data.projects : [createProjectItem()]).map((project) => `
          <article class="project-output-card">
            <h4>${escapeHtml(project.title || 'Featured Project')}</h4>
            <p>${escapeHtml(project.description || 'Describe what you built, the problem it solved, and why it matters.')}</p>
            ${project.link ? `<a href="${escapeAttribute(project.link)}" target="_blank" rel="noopener noreferrer">View project</a>` : ''}
          </article>
        `).join('')}
      </div>
    </div>

    <div class="section-block">
      <h3>Contact</h3>
      <div class="contact-grid">
        <div class="contact-row"><span>Email</span><a href="mailto:${escapeAttribute(data.email)}">${escapeHtml(data.email || 'hello@portify.studio')}</a></div>
        ${data.linkedin ? `<div class="contact-row"><span>LinkedIn</span><a href="${escapeAttribute(data.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.linkedin)}</a></div>` : ''}
        ${data.github ? `<div class="contact-row"><span>GitHub</span><a href="${escapeAttribute(data.github)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.github)}</a></div>` : ''}
      </div>
    </div>
  `;
}

function getInitials(name) {
  return (name || 'PF')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'PF';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function generatePortfolio() {
  if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(3)) {
    showToast('Please complete the required fields first.');
    return;
  }

  const data = collectFormData();
  const generated = {
    ...data,
    selectedTemplate: appState.selectedTemplate,
    profileImage: appState.profileImage,
    savedAt: new Date().toISOString()
  };

  appState.generatedPortfolio = generated;
  appState.history.unshift(generated);
  appState.history = appState.history.slice(0, 8);
  persistHistory();
  renderHistory();

  elements.loadingOverlay.classList.remove('hidden');
  elements.loadingOverlay.setAttribute('aria-hidden', 'false');

  window.setTimeout(() => {
    elements.portfolioPreview.innerHTML = buildPortfolioMarkup(generated);
    elements.outputSection.classList.remove('hidden');
    elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    elements.loadingOverlay.classList.add('hidden');
    elements.loadingOverlay.setAttribute('aria-hidden', 'true');
    showToast('Portfolio generated successfully.');
  }, 900);
}

function renderHistory() {
  if (!appState.history.length) {
    elements.historyGrid.innerHTML = `
      <article class="history-card glass">
        <div class="history-preview">Generated portfolios will appear here after you build one.</div>
      </article>
    `;
    return;
  }

  elements.historyGrid.innerHTML = appState.history.map((entry, index) => `
    <article class="history-card glass">
      <div class="history-preview">
        <div>
          <strong>${escapeHtml(entry.name || 'Unnamed Portfolio')}</strong>
          <p>${escapeHtml(entry.title || 'Portfolio saved in local storage')}</p>
        </div>
      </div>
      <div class="history-meta">
        <span>${new Date(entry.savedAt).toLocaleDateString()}</span>
        <span>${getTemplateStyle(entry.selectedTemplate).name}</span>
      </div>
      <button type="button" class="btn btn-secondary ripple view-history" data-index="${index}">View Again</button>
    </article>
  `).join('');

  elements.historyGrid.querySelectorAll('.view-history').forEach((button) => {
    button.addEventListener('click', (event) => {
      const index = Number(event.currentTarget.dataset.index);
      const entry = appState.history[index];
      if (!entry) return;
      appState.generatedPortfolio = entry;
      appState.selectedTemplate = entry.selectedTemplate || templateData[0].id;
      elements.portfolioPreview.innerHTML = buildPortfolioMarkup(entry);
      elements.outputSection.classList.remove('hidden');
      elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('Loaded a previous portfolio.');
    });
  });

  setupFloatingMicroMotion();
}

function attachRippleEffect(target) {
  target.addEventListener('click', (event) => {
    if (!target.classList.contains('ripple')) return;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-anim';
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    target.appendChild(ripple);
    target.classList.add('rippling');
    window.setTimeout(() => {
      ripple.remove();
      target.classList.remove('rippling');
    }, 620);
  });
}

function setupRipples() {
  document.querySelectorAll('.ripple').forEach((button) => attachRippleEffect(button));
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.ripple').forEach((button) => {
      if (!button.dataset.rippleReady) {
        button.dataset.rippleReady = 'true';
        attachRippleEffect(button);
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function setupRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));
}

function setupNavbar() {
  const update = () => {
    elements.navbar.classList.toggle('scrolled', window.scrollY > 12);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });

  elements.mobileToggle.addEventListener('click', () => {
    const open = elements.navLinks.classList.toggle('open');
    elements.mobileToggle.setAttribute('aria-expanded', String(open));
  });

  elements.navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 760) {
        elements.navLinks.classList.remove('open');
        elements.mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function setupParallax() {
  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.07;
    document.querySelectorAll('.bg-orb').forEach((orb, index) => {
      orb.style.translate = `${index % 2 === 0 ? offset : -offset}px ${offset * 0.24}px`;
    });
  }, { passive: true });
}

function setupCursorGlow() {
  if (!elements.cursorGlow) return;
  document.addEventListener('mousemove', (event) => {
    elements.cursorGlow.style.left = `${event.pageX}px`;
    elements.cursorGlow.style.top = `${event.pageY}px`;
  }, { passive: true });
}

function setupFloatingMicroMotion() {
  const floatingNodes = document.querySelectorAll('.floating-card, .template-card, .history-card');
  floatingNodes.forEach((node) => {
    if (node.dataset.floatReady === 'true') {
      return;
    }
    node.dataset.floatReady = 'true';

    const x = (Math.random() - 0.5) * 8;
    const y = (Math.random() - 0.5) * 8;
    const duration = 3 + Math.random() * 3;
    node.animate(
      [
        { transform: `translate3d(0, 0, 0)` },
        { transform: `translate3d(${x}px, ${y}px, 0)` },
        { transform: `translate3d(0, 0, 0)` }
      ],
      {
        duration: duration * 1000,
        iterations: Infinity,
        easing: 'ease-in-out'
      }
    );
  });
}

function setupTyping() {
  let index = 0;
  let charIndex = 0;
  let isDeleting = false;

  const tick = () => {
    const word = typingWords[index];
    const nextText = isDeleting ? word.slice(0, charIndex - 1) : word.slice(0, charIndex + 1);
    elements.typingText.textContent = nextText || word;

    if (!isDeleting && charIndex === word.length) {
      isDeleting = true;
      window.setTimeout(tick, 1300);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      index = (index + 1) % typingWords.length;
    }

    charIndex += isDeleting ? -1 : 1;
    window.setTimeout(tick, isDeleting ? 60 : 110);
  };

  tick();
}

function syncUiFromState() {
  renderTemplates();
  renderSkills();
  renderProjects();
  renderStep();
  renderHistory();
  renderImagePreview(appState.profileImage);
}

function bindEvents() {
  elements.addSkillBtn.addEventListener('click', () => addSkill(elements.skillInput.value));
  elements.skillInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill(elements.skillInput.value);
    }
  });

  elements.addProjectBtn.addEventListener('click', addProject);
  elements.profileImage.addEventListener('change', (event) => readProfileImage(event.target.files?.[0]));
  elements.nextStep.addEventListener('click', nextStep);
  elements.prevStep.addEventListener('click', previousStep);
  elements.saveDraftBtn.addEventListener('click', saveDraft);
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    generatePortfolio();
  });

  elements.printBtn.addEventListener('click', () => window.print());
  elements.editAgainBtn.addEventListener('click', () => {
    elements.outputSection.classList.add('hidden');
    document.getElementById('builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      elements.navLinks.classList.remove('open');
      elements.mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function restoreDraftToForm() {
  loadDraft();
  if (appState.projects.length === 0) {
    appState.projects = [createProjectItem()];
  }
  syncUiFromState();
  renderStep();
}

function setInitialStepVisibility() {
  if (appState.activeStep < 0 || appState.activeStep > 3) {
    appState.activeStep = 0;
  }
  renderStep();
}

function init() {
  createParticles();
  renderTemplates();
  setupCursorGlow();
  setupNavbar();
  setupParallax();
  setupFloatingMicroMotion();
  setupRevealObserver();
  setupTyping();
  bindEvents();
  setupRipples();
  restoreDraftToForm();
  setInitialStepVisibility();
  renderHistory();
}

init();
