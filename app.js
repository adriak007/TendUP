// Simple SPA-like behavior for Produção

const state = {
  employees: [],
  expandedId: null,
  currentWeekId: null,
};

// Default time slots (10 entries as listed)
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:30",
  "13:30",
  "14:30",
  "15:30",
  "16:30",
  "17:30",
];
const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

const employeesEl = document.getElementById("employees");
const addEmployeeBtn = document.getElementById("addEmployeeBtn");
const authBtn = document.getElementById("authBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebarEl = document.querySelector('.sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const overlayEl = document.getElementById("employeeOverlay");
const overlayContentEl = overlayEl?.querySelector('.overlay-content');

addEmployeeBtn?.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Faça login para adicionar funcionários.");
    return;
  }
  const name = window.prompt("Nome do funcionário:");
  if (!name) return;
  const employee = await dbCreateEmployee(name.trim());
  if (!employee) return;
  state.employees.push(employee);
  employeesEl.appendChild(renderEmployeeCard(employee));
});

let currentUser = null;

authBtn?.addEventListener('click', async () => {
  if (currentUser) {
    await window.sbSignOut?.();
    currentUser = null;
    state.employees = [];
    employeesEl.innerHTML = '';
    updateAuthUI();
    return;
  }
  const email = prompt('Email:');
  if (!email) return;
  const password = prompt('Senha:');
  if (!password) return;
  const { data, error } = await window.sbSignIn?.(email, password) || {};
  if (error) {
    const trySignUp = confirm('Usuário não encontrado. Criar conta?');
    if (trySignUp) {
      const { data: d2, error: e2 } = await window.sbSignUp?.(email, password) || {};
      if (e2) return alert('Erro ao cadastrar: ' + e2.message);
      alert('Cadastro criado. Verifique seu email se necessário e tente entrar novamente.');
    } else {
      return alert('Erro de login: ' + error.message);
    }
  }
  await initAuth();
});

function createEmployee(name) {
  return {
    id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
    name,
    meta: 100,
    weeks: [],
    draftWeek: null,
    nextWeekNumber: 1,
  };
}

function createWeek(employee) {
  const num = employee.nextWeekNumber || 1;
  employee.nextWeekNumber = num + 1;
  return {
    id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
    name: `Semana - ${num}`,
    days: ["", "", "", "", ""],
    values: Array.from({ length: TIME_SLOTS.length }, () => Array(5).fill("")),
  };
}

function renderEmployeeCard(employee) {
  const card = document.createElement("article");
  card.className = "employee-card";
  card.dataset.id = employee.id;

  const compact = document.createElement("div");
  compact.className = "employee-compact";
  compact.innerHTML = `
    <div class="employee-info">
      <div class="employee-name">${escapeHtml(employee.name)}</div>
      <div class="employee-hint">Clique para abrir</div>
    </div>
    <div class="employee-actions" aria-label="Ações do funcionário">
      <button class="btn-secondary btn-sm" data-action="edit" title="Editar nome">Editar</button>
      <button class="btn-danger btn-sm" data-action="delete" title="Excluir funcionário">Apagar</button>
    </div>
  `;
  card.appendChild(compact);

  const expanded = document.createElement("div");
  expanded.className = "employee-expanded";
  card.appendChild(expanded);

  compact.addEventListener("click", (e) => {
    e.stopPropagation();
    openOverlay(employee);
  });

  // Actions
  const actions = compact.querySelector('.employee-actions');
  actions.addEventListener('click', async (e) => {
    e.stopPropagation();
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'edit') {
      const newName = prompt('Novo nome do funcionário:', employee.name);
      if (!newName) return;
      const trimmed = newName.trim();
      if (!trimmed || trimmed === employee.name) return;
      await dbUpdateEmployeeName(employee.id, trimmed);
      employee.name = trimmed;
      const nameEl = compact.querySelector('.employee-name');
      if (nameEl) nameEl.textContent = employee.name;
      // Atualiza título da overlay se for o mesmo funcionário aberto
      if (state.expandedId === employee.id) {
        const title = document.querySelector('.overlay .overlay-title');
        if (title) title.textContent = employee.name;
      }
    }
    if (action === 'delete') {
      const ok = confirm(`Tem certeza que deseja apagar "${employee.name}"? Esta ação não pode ser desfeita.`);
      if (!ok) return;
      const deleted = await dbDeleteEmployee(employee.id);
      if (!deleted) return;
      // Remove do estado e DOM
      state.employees = state.employees.filter(e => e.id !== employee.id);
      if (state.expandedId === employee.id) {
        closeOverlay();
      }
      card.remove();
    }
  });

  return card;
}

function openOverlay(employee) {
  state.expandedId = employee.id;
  if (!overlayEl || !overlayContentEl) return;

  // Monta cabeçalho da overlay
  overlayContentEl.innerHTML = "";
  const header = document.createElement('div');
  header.className = 'overlay-header';
  header.innerHTML = `
    <button class="btn-icon" id="overlayBackBtn" aria-label="Voltar">← Voltar</button>
    <div class="overlay-title">${escapeHtml(employee.name)}</div>
    <div class="meta">
      <label for="meta-${employee.id}">Meta de produção</label>
      <input id="meta-${employee.id}" type="number" min="0" step="1" value="${employee.meta}" />
    </div>
  `;
  overlayContentEl.appendChild(header);

  const body = document.createElement('div');
  body.className = 'overlay-body';
  overlayContentEl.appendChild(body);

  // Toolbar Semanas
  const toolbar = document.createElement('div');
  toolbar.className = 'weeks-toolbar';
  toolbar.innerHTML = `
    <div style="color:var(--muted)">Semanas do funcionário</div>
    <div style="display:flex; gap:8px; align-items:center;">
      <button class="btn-secondary" id="addWeekBtn">Adicionar Semana</button>
      <button class="btn-primary" id="saveWeekBtn">Salvar</button>
    </div>
  `;
  body.appendChild(toolbar);

  const weeksList = document.createElement('div');
  weeksList.className = 'weeks-list';
  body.appendChild(weeksList);

  // Seleção inicial
  if (!state.currentWeekId) {
    if (employee.weeks && employee.weeks.length > 0) {
      state.currentWeekId = employee.weeks[employee.weeks.length - 1].id;
    } else {
      if (!employee.draftWeek) employee.draftWeek = createWeek(employee);
      state.currentWeekId = employee.draftWeek.id;
    }
  }

  renderWeeksUI(employee, weeksList, body);

  const metaInput = header.querySelector(`#meta-${employee.id}`);
  let metaDebounce;
  metaInput.addEventListener('input', () => {
    const v = Number(metaInput.value);
    employee.meta = Number.isFinite(v) ? v : 0;
    renderWeeksUI(employee, weeksList, body);
    clearTimeout(metaDebounce);
    metaDebounce = setTimeout(async () => {
      await dbUpdateEmployeeMeta(employee.id, employee.meta);
    }, 400);
  });

  toolbar.querySelector('#addWeekBtn')?.addEventListener('click', () => {
    const current = getCurrentWeek(employee);
    if (current && employee.draftWeek && current.id === employee.draftWeek.id) {
      // Guarda a que estava (empilha)
      employee.weeks.push(employee.draftWeek);
      employee.draftWeek = null;
    }
    employee.draftWeek = createWeek(employee);
    state.currentWeekId = employee.draftWeek.id;
    renderWeeksUI(employee, weeksList, body);
  });

  toolbar.querySelector('#saveWeekBtn')?.addEventListener('click', () => {
    const current = getCurrentWeek(employee);
    if (!current) return;
    const isDraft = employee.draftWeek && current.id === employee.draftWeek.id;
    if (isDraft) {
      // persist new
      dbInsertWeek(employee.id, current).then((saved) => {
        if (saved) {
          // replace draft with saved
          employee.weeks.push(saved);
          employee.draftWeek = null;
          state.currentWeekId = saved.id;
          renderWeeksUI(employee, weeksList, body);
        }
      });
      return;
    }
    // existing week: update
    dbUpdateWeek(current).then(() => {
      renderWeeksUI(employee, weeksList, body);
    });
  });

  // Abrir overlay
  overlayEl.classList.add('open');
  overlayEl.setAttribute('aria-hidden', 'false');

  // Voltar
  header.querySelector('#overlayBackBtn')?.addEventListener('click', () => closeOverlay());
}

function closeOverlay() {
  if (!overlayEl || !overlayContentEl) return;
  overlayEl.classList.remove('open');
  overlayEl.setAttribute('aria-hidden', 'true');
  overlayContentEl.innerHTML = '';
  state.expandedId = null;
  state.currentWeekId = null;
}

// Fechar ao clicar fora do conteúdo
overlayEl?.addEventListener('click', (e) => {
  if (e.target === overlayEl) closeOverlay();
});

// Sidebar mobile toggling
function toggleSidebar(open) {
  if (!sidebarEl || !sidebarBackdrop) return;
  const willOpen = open ?? !sidebarEl.classList.contains('open');
  sidebarEl.classList.toggle('open', willOpen);
  sidebarBackdrop.classList.toggle('open', willOpen);
  sidebarBackdrop.setAttribute('aria-hidden', String(!willOpen));
}

menuBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSidebar(true);
});
sidebarBackdrop?.addEventListener('click', () => toggleSidebar(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleSidebar(false);
  }
});

function renderWeeksUI(employee, weeksListEl, bodyEl) {
  // Lista de semanas salvas
  weeksListEl.innerHTML = '';
  (employee.weeks || []).forEach((week) => {
    const card = document.createElement('div');
    card.className = 'week-card' + (state.currentWeekId === week.id ? ' active' : '');
    card.dataset.id = week.id;
    card.innerHTML = `<span>${escapeHtml(week.name)}</span><span>›</span>`;
    card.addEventListener('click', () => {
      state.currentWeekId = week.id;
      renderWeeksUI(employee, weeksListEl, bodyEl);
    });
    weeksListEl.appendChild(card);
  });

  // Editor
  let editor = bodyEl.querySelector('.editor-section');
  if (editor) editor.remove();
  editor = document.createElement('div');
  editor.className = 'editor-section';
  bodyEl.appendChild(editor);

  const current = getCurrentWeek(employee);
  if (!current) {
    editor.innerHTML = `<div style="padding:16px; color:var(--muted)">Nenhuma semana selecionada. Clique em "Adicionar Semana".</div>`;
    return;
  }

  const editorHeader = document.createElement('div');
  editorHeader.className = 'editor-header';
  editorHeader.innerHTML = `
    <label for="week-name" style="color:var(--muted)">Nome da semana</label>
    <input id="week-name" type="text" value="${escapeHtml(current.name)}" />
  `;
  editor.appendChild(editorHeader);

  const nameInput = editorHeader.querySelector('#week-name');
  nameInput.addEventListener('input', () => {
    current.name = nameInput.value;
    const label = weeksListEl.querySelector(`.week-card[data-id="${current.id}"] span:first-child`);
    if (label) label.textContent = current.name;
  });
  nameInput.addEventListener('blur', () => { dbUpdateWeek(current); });

  const schedule = document.createElement('div');
  schedule.className = 'schedule';
  editor.appendChild(schedule);

  const grid = document.createElement('div');
  grid.className = 'grid';
  schedule.appendChild(grid);

  const blank = document.createElement('div');
  blank.className = 'time';
  grid.appendChild(blank);

  for (let c = 0; c < 5; c++) {
    const day = document.createElement('div');
    day.className = 'day';
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = `Dia ${c + 1}`;
    inp.value = current.days[c] || '';
    inp.inputMode = 'numeric';
    inp.maxLength = 5;
    inp.addEventListener('input', () => {
      const formatted = formatDay(inp.value);
      inp.value = formatted;
      current.days[c] = formatted;
    });
    day.appendChild(inp);
    grid.appendChild(day);
  }

  // Static weekday labels row
  const blank2 = document.createElement('div');
  blank2.className = 'time';
  grid.appendChild(blank2);
  for (let c = 0; c < 5; c++) {
    const dl = document.createElement('div');
    dl.className = 'day';
    dl.textContent = WEEKDAY_LABELS[c] || '';
    grid.appendChild(dl);
  }

  for (let r = 0; r < TIME_SLOTS.length; r++) {
    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = TIME_SLOTS[r];
    grid.appendChild(time);

    for (let c = 0; c < 5; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = '0';
      inp.step = '1';
      inp.inputMode = 'numeric';
      inp.value = current.values[r][c];
      if (!inp.value) inp.classList.add('empty');
      inp.addEventListener('input', () => {
        if (!inp.value) inp.classList.add('empty'); else inp.classList.remove('empty');
        current.values[r][c] = inp.value;
        paintCell(cell, inp.value, employee.meta);
      });
      inp.addEventListener('blur', () => { /* opcional: update pontual */ });
      cell.appendChild(inp);
      grid.appendChild(cell);
    }
  }

  const legend = document.createElement('div');
  legend.className = 'legend';
  legend.innerHTML = `
    <span>Baixo</span>
    <span class="legend-swatch" aria-hidden="true"></span>
    <span>Alto</span>
  `;
  schedule.appendChild(legend);

  paintAllCells(grid, employee.meta);
}

function getCurrentWeek(employee) {
  const id = state.currentWeekId;
  if (employee.draftWeek && employee.draftWeek.id === id) return employee.draftWeek;
  const found = (employee.weeks || []).find(w => w.id === id);
  return found || null;
}

// ========= Supabase binding (CRUD) =========
async function initAuth() {
  const session = await window.sbGetSession?.();
  currentUser = session?.user || null;
  updateAuthUI();
  if (currentUser) {
    await loadAllData();
  }
}

function updateAuthUI() {
  if (!authBtn) return;
  authBtn.textContent = currentUser ? 'Sair' : 'Entrar';
}

async function loadAllData() {
  employeesEl.innerHTML = '';
  state.employees = await dbFetchEmployees();
  state.employees.forEach(emp => {
    employeesEl.appendChild(renderEmployeeCard(emp));
  });
}

async function dbFetchEmployees() {
  if (!window.sb || !currentUser) return [];
  const { data, error } = await window.sb.from('employees').select('id,name,meta,weeks:weeks(id,name,days,values)').eq('user_id', currentUser.id).order('created_at', { ascending: true });
  if (error) { console.error(error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    meta: row.meta ?? 100,
    weeks: (row.weeks || []).map(w => ({ id: w.id, name: w.name, days: w.days || ["","","","",""], values: w.values || Array.from({length: TIME_SLOTS.length}, () => Array(5).fill("")) })),
    draftWeek: null,
    nextWeekNumber: ((row.weeks || []).length || 0) + 1,
  }));
}

async function dbCreateEmployee(name) {
  if (!window.sb || !currentUser) return null;
  const { data, error } = await window.sb.from('employees').insert({ user_id: currentUser.id, name, meta: 100 }).select('id,name,meta').single();
  if (error) { alert('Erro ao criar funcionário: ' + error.message); return null; }
  return { id: data.id, name: data.name, meta: data.meta ?? 100, weeks: [], draftWeek: null, nextWeekNumber: 1 };
}

async function dbUpdateEmployeeMeta(employeeId, meta) {
  if (!window.sb || !currentUser) return;
  await window.sb.from('employees').update({ meta }).eq('id', employeeId).eq('user_id', currentUser.id);
}

async function dbUpdateEmployeeName(employeeId, name) {
  if (!window.sb || !currentUser) return;
  await window.sb.from('employees').update({ name }).eq('id', employeeId).eq('user_id', currentUser.id);
}

async function dbDeleteEmployee(employeeId) {
  if (!window.sb || !currentUser) return false;
  const { error } = await window.sb.from('employees').delete().eq('id', employeeId).eq('user_id', currentUser.id);
  if (error) { alert('Erro ao apagar funcionário: ' + error.message); return false; }
  return true;
}

async function dbInsertWeek(employeeId, week) {
  if (!window.sb || !currentUser) return null;
  const payload = { employee_id: employeeId, name: week.name, days: week.days, values: week.values };
  const { data, error } = await window.sb.from('weeks').insert(payload).select('id,name,days,values').single();
  if (error) { alert('Erro ao salvar semana: ' + error.message); return null; }
  return { id: data.id, name: data.name, days: data.days, values: data.values };
}

async function dbUpdateWeek(week) {
  if (!window.sb || !currentUser || !week?.id) return;
  await window.sb.from('weeks').update({ name: week.name, days: week.days, values: week.values }).eq('id', week.id);
}

// Init
initAuth();

function paintAllCells(grid, meta) {
  const cells = grid.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const inp = cell.querySelector("input");
    paintCell(cell, inp.value, meta);
  });
}

function paintCell(cell, value, meta) {
  const v = Number(value);
  const m = Number(meta);
  // Neutro quando vazio ou meta inválida
  if (!Number.isFinite(v) || !Number.isFinite(m) || m <= 0) {
    cell.style.background = "var(--cell-bg)";
    return;
  }

  // Razão limitada entre 0 e 1
  const r = Math.max(0, Math.min(1, v / m));

  let hue;
  // Até metade da meta: vermelho sólido
  if (r <= 0.5) {
    hue = 0; // vermelho
  } else {
    // Curva não linear para concentrar o degradê perto da meta
    const t = Math.pow((r - 0.5) / 0.5, 1.4); // r=0.6→quase vermelho, r=0.8→amarelado
    hue = 120 * Math.max(0, Math.min(1, t)); // até verde
  }

  const sat = 70; // %
  const light = 42; // manter intensidade consistente
  cell.style.background = `hsl(${hue} ${sat}% ${light}%)`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Formatar como NN/NN (mantém apenas dígitos)
function formatDay(value) {
  const digits = String(value).replace(/\D+/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}
