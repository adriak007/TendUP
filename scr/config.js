window.SUPABASE_URL = "https://kppekoynogzqzhhtnwth.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcGVrb3lub2d6cXpoaHRud3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDY2MzgsImV4cCI6MjA3ODI4MjYzOH0.m7UfDAbcx0JeIXAsig8NnQy0aRzM9CFwNdFFJQZt5IY";

// Enhancer: modo de teste (LocalStorage) e modal de adicionar funcionário
document.addEventListener('DOMContentLoaded', () => {
  const USE_MOCK = (function(){
    try {
      const sp = new URLSearchParams(location.search);
      if (sp.get('mock') === '1') { localStorage.setItem('mockMode', '1'); return true; }
      return localStorage.getItem('mockMode') === '1';
    } catch (_) { return false; }
  })();

  if (!USE_MOCK) return;

  function showTestBadge() {
    try {
      const headerActions = document.querySelector('.main-header > div');
      if (!headerActions) return;
      let badge = document.getElementById('testBadge');
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'testBadge';
        badge.className = 'badge-test';
        badge.textContent = 'Modo Teste';
        headerActions.prepend(badge);
      }
      badge.hidden = false;
    } catch (_) {}
  }

  function readMock() {
    try { return JSON.parse(localStorage.getItem('tendup_mock_employees') || '[]'); } catch (_) { return []; }
  }
  function writeMock(list) {
    try { localStorage.setItem('tendup_mock_employees', JSON.stringify(list||[])); } catch (_) {}
  }
  function uid() { return (crypto.randomUUID?.() || String(Date.now() + Math.random())); }

  // Overrides de DB (sem depender de currentUser)
  window.dbFetchEmployees = async () => {
    const list = readMock();
    return list.map(row => ({
      id: row.id,
      name: row.name,
      meta: Number.isFinite(row.meta) ? row.meta : 100,
      weeks: (row.weeks || []).map(w => ({ id: w.id, name: w.name, days: w.days || ["","","","",""], values: w.values || Array.from({length: 10}, () => Array(5).fill("")) })),
      draftWeek: null,
      nextWeekNumber: ((row.weeks || []).length || 0) + 1,
    }));
  };
  window.dbCreateEmployee = async (name) => {
    const list = readMock();
    const e = { id: uid(), name, meta: 100, weeks: [], draftWeek: null, nextWeekNumber: 1 };
    list.push({ id: e.id, name: e.name, meta: e.meta, weeks: [] });
    writeMock(list);
    return e;
  };
  window.dbUpdateEmployeeMeta = async (employeeId, meta) => {
    const list = readMock();
    const idx = list.findIndex(x => x.id === employeeId);
    if (idx >= 0) { list[idx].meta = meta; writeMock(list); }
  };
  window.dbUpdateEmployeeName = async (employeeId, name) => {
    const list = readMock();
    const idx = list.findIndex(x => x.id === employeeId);
    if (idx >= 0) { list[idx].name = name; writeMock(list); }
  };
  window.dbDeleteEmployee = async (employeeId) => {
    let list = readMock();
    const before = list.length;
    list = list.filter(x => x.id !== employeeId);
    writeMock(list);
    return before !== list.length;
  };
  window.dbInsertWeek = async (employeeId, week) => {
    const list = readMock();
    const idx = list.findIndex(x => x.id === employeeId);
    if (idx < 0) return null;
    const saved = { id: uid(), name: week.name, days: week.days, values: week.values };
    list[idx].weeks = list[idx].weeks || [];
    list[idx].weeks.push(saved);
    writeMock(list);
    return saved;
  };
  window.dbUpdateWeek = async (week) => {
    const list = readMock();
    for (const emp of list) {
      const w = (emp.weeks || []).find(x => x.id === week.id);
      if (w) { w.name = week.name; w.days = week.days; w.values = week.values; writeMock(list); return; }
    }
  };

  // Modal de adicionar
  function ensureAddEmployeeModal() {
    let modal = document.getElementById('addEmployeeModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'addEmployeeModal';
    modal.className = 'overlay';
    modal.innerHTML = `
      <div class="overlay-content modal-sm" role="dialog" aria-modal="true" aria-label="Adicionar Funcionário">
        <div class="overlay-header">
          <div class="overlay-title">Novo Funcionário</div>
          <button class="btn-icon" id="addEmpCloseBtn" aria-label="Fechar">✕</button>
        </div>
        <div class="overlay-body" style="padding:16px; display:grid; gap:12px;">
          <label for="addEmpName">Nome</label>
          <input id="addEmpName" type="text" placeholder="Digite o nome" />
          <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:4px;">
            <button id="addEmpCancel" class="btn-secondary">Cancelar</button>
            <button id="addEmpSave" class="btn-primary">Salvar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); };
    modal.querySelector('#addEmpCloseBtn')?.addEventListener('click', close);
    modal.querySelector('#addEmpCancel')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.querySelector('#addEmpSave')?.addEventListener('click', async () => {
      const input = modal.querySelector('#addEmpName');
      const name = String(input?.value || '').trim();
      if (!name) { alert('Informe o nome'); return; }
      const employee = await window.dbCreateEmployee(name);
      if (!employee) return;
      try {
        window.state.employees.push(employee);
        document.getElementById('employees')?.appendChild(window.renderEmployeeCard(employee));
      } catch (_) {}
      close();
    });
    return modal;
  }
  function openAddEmployeeModal() {
    const modal = ensureAddEmployeeModal();
    const input = modal.querySelector('#addEmpName');
    if (input) input.value = '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    setTimeout(() => input?.focus(), 0);
  }

  // Rebind botões para não usar prompt/login padrão
  function rebindButton(id, handler) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', handler);
  }

  showTestBadge();
  // Atualiza texto do botão de auth
  try { const b = document.getElementById('authBtn'); if (b) b.textContent = 'Sair do Teste'; } catch(_) {}

  // Rebind Add Funcionário -> modal
  rebindButton('addEmployeeBtn', () => openAddEmployeeModal());
  // Rebind Auth -> sair do teste
  rebindButton('authBtn', () => { try { localStorage.removeItem('mockMode'); } catch(_){} window.location.href = 'index.html'; });

  // Carrega dados mock
try { window.loadAllData?.(); } catch(_){}
});

// Sempre melhorar o fluxo de "Adicionar Funcionário" com modal, mesmo fora do modo teste
document.addEventListener('DOMContentLoaded', () => {
  function ensureAddEmployeeModal2() {
    let modal = document.getElementById('addEmployeeModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'addEmployeeModal';
    modal.className = 'overlay';
    modal.innerHTML = `
      <div class="overlay-content modal-sm" role="dialog" aria-modal="true" aria-label="Adicionar Funcionário">
        <div class="overlay-header">
          <div class="overlay-title">Novo Funcionário</div>
          <button class="btn-icon" id="addEmpCloseBtn" aria-label="Fechar">✕</button>
        </div>
        <div class="overlay-body" style="padding:16px; display:grid; gap:12px;">
          <label for="addEmpName">Nome</label>
          <input id="addEmpName" type="text" placeholder="Digite o nome" />
          <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:4px;">
            <button id="addEmpCancel" class="btn-secondary">Cancelar</button>
            <button id="addEmpSave" class="btn-primary">Salvar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); };
    modal.querySelector('#addEmpCloseBtn')?.addEventListener('click', close);
    modal.querySelector('#addEmpCancel')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.querySelector('#addEmpSave')?.addEventListener('click', async () => {
      const input = modal.querySelector('#addEmpName');
      const name = String(input?.value || '').trim();
      if (!name) { alert('Informe o nome'); return; }
      try {
        const employee = await (window.dbCreateEmployee?.(name));
        if (!employee) return;
        window.state?.employees?.push?.(employee);
        document.getElementById('employees')?.appendChild(window.renderEmployeeCard?.(employee));
        close();
      } catch (_) {
        // fallback: se falhar, deixa o fluxo original
      }
    });
    return modal;
  }
  function openAddEmployeeModal2() {
    const modal = ensureAddEmployeeModal2();
    const input = modal.querySelector('#addEmpName');
    if (input) input.value = '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    setTimeout(() => input?.focus(), 0);
  }
  const btn = document.getElementById('addEmployeeBtn');
  if (btn) {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', (e) => {
      e.preventDefault();
      openAddEmployeeModal2();
    });
  }
});
