// Inicializa cliente Supabase a partir de variáveis globais definidas em config.js
(function(){
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY || !window.supabase) {
    console.warn("Supabase não configurado. Crie config.js a partir de config.example.js e verifique o CDN.");
    window.sb = null;
    return;
  }
  window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  window.sbGetSession = async () => {
    if (!window.sb) return null;
    const { data } = await window.sb.auth.getSession();
    return data.session || null;
  };

  window.sbSignIn = async (email, password) => {
    if (!window.sb) throw new Error("Supabase não inicializado");
    return window.sb.auth.signInWithPassword({ email, password });
  };

  window.sbSignUp = async (email, password) => {
    if (!window.sb) throw new Error("Supabase não inicializado");
    return window.sb.auth.signUp({ email, password });
  };

  window.sbSignOut = async () => {
    if (!window.sb) return;
    await window.sb.auth.signOut();
  };
})();

