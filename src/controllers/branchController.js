const centralService = require('../services/centralService');

// Credenciales autorizadas para ejecutivos de la sucursal (pueden ser configuradas vía .env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ejecutivo1@sucursal.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin2026!';

/**
 * Muestra la vista de Inicio de Sesión
 */
exports.getLogin = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
};

/**
 * Procesa la autenticación con verificación estricta de credenciales de ejecutivo
 */
exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  console.log('>>> [POST /login] Intentando autenticar ejecutivo:', email);

  if (!email || !password) {
    return res.render('login', { error: 'Por favor ingresa correo y contraseña.' });
  }

  // Validación de credenciales de ejecutivo autorizado
  if (
    email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
    password !== ADMIN_PASSWORD
  ) {
    console.log('>>> Acceso denegado: Credenciales no autorizadas');
    return res.render('login', { 
      error: 'Credenciales inválidas. Acceso denegado para personal no autorizado.' 
    });
  }

  if (req.session) {
    req.session.user = { email: email.trim().toLowerCase() };
  }

  return res.redirect('/dashboard');
};

/**
 * Muestra el Dashboard calculando el efectivo dinámicamente
 */
exports.getDashboard = async (req, res) => {
  try {
    const user = req.session.user;
    const { success, account, titular, error } = req.query;
    
    // Obtener reporte/datos centrales para calcular el efectivo disponible dinámicamente
    const reportData = await centralService.getReports();
    const efectivoCalculado = reportData.efectivo_caja ?? centralService.getEfectivoCaja();

    const nodeInfo = {
      efectivo_disponible: Number(efectivoCalculado).toLocaleString('es-MX', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }),
      nombre: 'Sucursal Centro',
      nodo: 'Nodo 2'
    };

    let notification = null;
    if (success === 'true') {
      notification = {
        type: 'success',
        title: '¡Cuenta creada exitosamente en el Banco Central!',
        account: account || 'N/A',
        titular: titular || 'Cliente'
      };
    } else if (error) {
      notification = {
        type: 'error',
        message: error
      };
    }

    res.render('dashboard', { 
      user: user.email || user,
      nodeInfo,
      notification 
    });
  } catch (err) {
    console.error('>>> Error al cargar el Dashboard:', err.message);
    const efectivoFallback = centralService.getEfectivoCaja();
    res.render('dashboard', { 
      user: req.session?.user?.email || 'ejecutivo1@sucursal.com',
      nodeInfo: { 
        efectivo_disponible: Number(efectivoFallback).toLocaleString('es-MX', { minimumFractionDigits: 2 }) 
      },
      notification: null
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

    const numCuenta = resultado.cuenta?.numero_cuenta || resultado.numero_cuenta || '0000000000';

    return res.redirect(`/dashboard?success=true&account=${encodeURIComponent(numCuenta)}&titular=${encodeURIComponent(titular)}`);

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
 * Genera y emite la vista de Reportes Administrativos de Operaciones
 */
exports.getReports = async (req, res) => {
  try {
    const reportData = await centralService.getReports();
    
    return res.render('reports', { 
      report: reportData,
      fechaEmision: new Date().toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' }),
      error: null 
    });
  } catch (error) {
    console.error('>>> Error al generar el reporte:', error.message);
    return res.render('reports', { 
      report: {
        total_cuentas: 0,
        total_depositos: 0,
        total_retiros: 0,
        balance_neto: 0,
        efectivo_caja: centralService.getEfectivoCaja(),
        operaciones: []
      },
      fechaEmision: new Date().toLocaleString('es-MX'),
      error: 'Ocurrió un inconveniente al consolidar la información operativa.' 
    });
  }
};

/**
 * Cierra la sesión activa
 */
exports.logout = (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
};