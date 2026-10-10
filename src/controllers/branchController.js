const centralService = require('../services/centralService');

/**
 * Muestra la vista de Inicio de Sesión
 */
exports.getLogin = (req, res) => {
  res.render('login', { error: null });
};

/**
 * Procesa la autenticación del ejecutivo
 */
exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  console.log('>>> [POST /login] Intentando autenticar ejecutivo:', email);

  if (!email || !password) {
    return res.render('login', { error: 'Por favor ingresa correo y contraseña.' });
  }

  // Guarda las credenciales en la sesión
  if (req.session) {
    req.session.user = { email };
  }

  return res.redirect('/dashboard');
};

/**
 * Muestra el Dashboard principal de la Sucursal (Nodo 2)
 */
exports.getDashboard = async (req, res) => {
  try {
    const user = req.session?.user || { email: 'ejecutivo1@sucursal.com' };
    
    const nodeInfo = {
      efectivo_disponible: '5,000.00',
      nombre: 'Sucursal Centro',
      nodo: 'Nodo 2'
    };

    res.render('dashboard', { 
      user: user.email || user,
      nodeInfo 
    });
  } catch (error) {
    console.error('>>> Error al cargar el Dashboard:', error.message);
    res.render('dashboard', { 
      user: 'ejecutivo1@sucursal.com',
      nodeInfo: { efectivo_disponible: '5,000.00' } 
    });
  }
};

/**
 * Muestra el formulario de Apertura de Cuenta
 */
exports.getNewClient = (req, res) => {
  res.render('new-client', { error: null });
};

/**
 * Procesa la creación de la cuenta enviando la solicitud al Banco Central
 */
exports.createAccount = async (req, res) => {
  console.log('>>> [POST /create-account] Datos recibidos del formulario:', req.body);

  try {
    const { titular, saldo_inicial } = req.body;

    // Validación de campos vacíos
    if (!titular || saldo_inicial === undefined || saldo_inicial === '') {
      console.log('>>> Error: Campos incompletos en el formulario');
      return res.render('new-client', { error: 'Por favor completa todos los campos requeridos.' });
    }

    // Conversión a tipo numérico
    const saldo = Number(saldo_inicial);
    if (isNaN(saldo) || saldo < 0) {
      console.log('>>> Error: Saldo inicial inválido');
      return res.render('new-client', { error: 'El saldo inicial debe ser un número válido mayor o igual a 0.' });
    }

    // Petición a la API Central
    console.log('>>> Enviando solicitud de registro al Banco Central...');
    const resultado = await centralService.createAccount({ 
      titular, 
      saldo_inicial: saldo 
    });

    console.log('>>> Respuesta exitosa del Banco Central:', resultado);

    // Redirección al Dashboard al finalizar con éxito
    return res.redirect('/dashboard');

  } catch (error) {
    console.error('>>> Error detectado al procesar en Central:', error.response?.data || error.message);
    
    // Captura el mensaje retornado por el backend de la Central
    const mensajeError = error.response?.data?.error 
      || error.response?.data?.mensaje 
      || 'No se pudo crear la cuenta en la Central.';
    
    return res.render('new-client', { error: mensajeError });
  }
};

/**
 * Cierra la sesión activa
 */
exports.logout = (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
};