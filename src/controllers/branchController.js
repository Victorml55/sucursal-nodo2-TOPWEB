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

    if (!titular || saldo_inicial === undefined || saldo_inicial === '') {
      console.log('>>> Error: Campos incompletos en el formulario');
      return res.render('new-client', { error: 'Por favor completa todos los campos requeridos.' });
    }

    const saldo = Number(saldo_inicial);
    if (isNaN(saldo) || saldo < 0) {
      console.log('>>> Error: Saldo inicial inválido');
      return res.render('new-client', { error: 'El saldo inicial debe ser un número válido mayor o igual a 0.' });
    }

    console.log('>>> Enviando solicitud de registro al Banco Central...');
    const resultado = await centralService.createAccount({ 
      titular, 
      saldo_inicial: saldo 
    });

    console.log('>>> Respuesta exitosa del Banco Central:', resultado);

    return res.redirect('/dashboard');

  } catch (error) {
    console.error('>>> Error detectado al procesar en Central:', error.response?.data || error.message);
    
    const mensajeError = error.response?.data?.error 
      || error.response?.data?.mensaje 
      || 'No se pudo crear la cuenta en la Central.';
    
    return res.render('new-client', { error: mensajeError });
  }
};

/**
 * Consulta información de cuenta e historial de transacciones
 */
exports.searchAccount = async (req, res) => {
  const { numero_cuenta } = req.query;

  console.log('>>> [GET /search-account] Buscando cuenta:', numero_cuenta);

  if (!numero_cuenta) {
    return res.render('account-details', { 
      cuenta: null, 
      transacciones: [], 
      error: 'Ingresa un número de cuenta válido para realizar la búsqueda.',
      busqueda: ''
    });
  }

  try {
    const data = await centralService.getAccountDetails(numero_cuenta.trim());
    
    const cuenta = data.cuenta || data;
    const transacciones = data.transacciones || data.historial || [];

    console.log('>>> Cuenta encontrada:', cuenta.numero_cuenta || numero_cuenta);

    return res.render('account-details', { 
      cuenta, 
      transacciones, 
      error: null,
      busqueda: numero_cuenta
    });

  } catch (error) {
    console.error('>>> Error al consultar cuenta en Central:', error.response?.data || error.message);
    
    return res.render('account-details', { 
      cuenta: null, 
      transacciones: [], 
      error: 'No se encontró la cuenta especificada o la Central no respondió.',
      busqueda: numero_cuenta
    });
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