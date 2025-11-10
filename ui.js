// Simple, styled modal helpers: showAlert, showConfirm, showPrompt
(function(){
  function ensureHost(){
    let host = document.getElementById('ui-modal-host');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'ui-modal-host';
    document.body.appendChild(host);
    return host;
  }
  function overlayTemplate(inner){
    const wrap = document.createElement('div');
    wrap.className = 'overlay open';
    wrap.setAttribute('aria-hidden','false');
    wrap.innerHTML = `<div class="overlay-content modal-sm">${inner}</div>`;
    return wrap;
  }
  function buttonsHtml(primary, secondary){
    return `<div style="display:flex; gap:8px; justify-content:flex-end;">
      ${secondary? `<button class="btn-secondary" data-role="secondary">${secondary}</button>`: ''}
      ${primary? `<button class="btn-primary" data-role="primary">${primary}</button>`: ''}
    </div>`;
  }

  async function showAlert(message, {title='Aviso', primaryText='OK'}={}){
    return new Promise((resolve)=>{
      const host = ensureHost();
      const overlay = overlayTemplate(`
        <div class="overlay-header"><div class="overlay-title">${title}</div></div>
        <div class="overlay-body" style="padding:16px;">${message}</div>
        <div style="padding:0 16px 16px;">${buttonsHtml(primaryText)}</div>`);
      host.appendChild(overlay);
      const close = ()=>{ overlay.remove(); resolve(); };
      overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
      overlay.querySelector('[data-role="primary"]').addEventListener('click', close);
    });
  }

  async function showConfirm(message, {title='Confirmar', confirmText='Confirmar', cancelText='Cancelar'}={}){
    return new Promise((resolve)=>{
      const host = ensureHost();
      const overlay = overlayTemplate(`
        <div class="overlay-header"><div class="overlay-title">${title}</div></div>
        <div class="overlay-body" style="padding:16px;">${message}</div>
        <div style="padding:0 16px 16px;">${buttonsHtml(confirmText, cancelText)}</div>`);
      host.appendChild(overlay);
      const done = (v)=>{ overlay.remove(); resolve(v); };
      overlay.addEventListener('click', (e)=>{ if(e.target===overlay) done(false); });
      overlay.querySelector('[data-role="primary"]').addEventListener('click', ()=>done(true));
      overlay.querySelector('[data-role="secondary"]').addEventListener('click', ()=>done(false));
    });
  }

  async function showPrompt({title='Entrada', label='Valor', initial=''}={}){
    return new Promise((resolve)=>{
      const host = ensureHost();
      const overlay = overlayTemplate(`
        <div class="overlay-header"><div class="overlay-title">${title}</div></div>
        <div class="overlay-body" style="padding:16px; display:grid; gap:8px;">
          <label>${label}</label>
          <input id="uiPromptInput" type="text" value="${String(initial||'').replaceAll('"','&quot;')}" />
        </div>
        <div style="padding:0 16px 16px;">${buttonsHtml('Salvar', 'Cancelar')}</div>`);
      host.appendChild(overlay);
      const input = overlay.querySelector('#uiPromptInput');
      setTimeout(()=> input?.focus(), 0);
      const done = (v)=>{ overlay.remove(); resolve(v); };
      overlay.addEventListener('click', (e)=>{ if(e.target===overlay) done(null); });
      overlay.querySelector('[data-role="primary"]').addEventListener('click', ()=> done(String(input.value)));
      overlay.querySelector('[data-role="secondary"]').addEventListener('click', ()=> done(null));
      input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); done(String(input.value)); } if(e.key==='Escape'){ e.preventDefault(); done(null);} });
    });
  }

  window.showAlert = showAlert;
  window.showConfirm = showConfirm;
  window.showPrompt = showPrompt;
})();

