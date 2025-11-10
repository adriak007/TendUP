document.addEventListener('DOMContentLoaded', () => {
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const testBtn = document.getElementById('testBtn');
  const signupLink = document.getElementById('signupLink');

  loginBtn?.addEventListener('click', async () => {
    const e = String(email?.value || '').trim();
    const p = String(password?.value || '').trim();
    if (!e || !p) { alert('Informe email e senha'); return; }
    try {
      const { error } = await window.sbSignIn?.(e, p) || {};
      if (error) { alert('Erro de login: ' + error.message); return; }
      window.location.href = 'index.html';
    } catch (err) {
      alert('Erro de login');
    }
  });

  signupLink?.addEventListener('click', async (ev) => {
    ev.preventDefault();
    const e = String(email?.value || '').trim();
    const p = String(password?.value || '').trim();
    if (!e || !p) { alert('Preencha email e senha para criar a conta'); return; }
    try {
      const { error } = await window.sbSignUp?.(e, p) || {};
      if (error) { alert('Erro ao cadastrar: ' + error.message); return; }
      alert('Cadastro criado. Tente entrar em seguida.');
    } catch (_) {
      alert('Erro ao cadastrar');
    }
  });

  testBtn?.addEventListener('click', () => {
    try { localStorage.setItem('mockMode', '1'); } catch(_){}
    window.location.href = 'index.html?mock=1';
  });
});

