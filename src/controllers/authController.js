const supabase = require('../config/supabase');

exports.renderLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // 2. Guardar datos clave del ejecutivo en sesión
    req.session.user = {
      id: data.user.id,
      email: data.user.email
    };

    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { error: 'Credenciales inválidas o fallo de conexión.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};