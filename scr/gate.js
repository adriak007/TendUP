// Redireciona para login ao abrir o site, a menos que já esteja logado
// ou esteja em modo teste (LocalStorage/mock)
(async function gate() {
  try {
    const sp = new URLSearchParams(location.search);
    if (sp.get('mock') === '1') {
      try { localStorage.setItem('mockMode', '1'); } catch (_) {}
      return; // Permite entrar direto em modo teste
    }
    const mock = (() => { try { return localStorage.getItem('mockMode') === '1'; } catch (_) { return false; } })();
    if (mock) return; // Em modo teste, não redireciona

    // Verifica sessão Supabase
    if (typeof window.sbGetSession !== 'function') {
      // supabase.js ainda não criou o helper; tenta novamente em tick seguinte
      setTimeout(gate, 0);
      return;
    }
    const session = await window.sbGetSession();
    if (!session) {
      window.location.replace('login.html');
    }
  } catch (_) {
    // Em caso de erro, joga para login para garantir experiência
    try { window.location.replace('login.html'); } catch (_e) {}
  }
})();

