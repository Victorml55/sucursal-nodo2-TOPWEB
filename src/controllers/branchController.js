const centralService = require('../services/centralService');
const supabase = require('../config/supabase');

// 1. Mostrar Dashboard (Línea 8 de las rutas)
exports.renderDashboard = async (req, res) => {
  try {

    const user = req.user || req.session?.user || { email: 'ejecutivo@sucursal.com' };

    res.render('dashboard', { 
      user: user, 
      error: null 
    });
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    res.render('dashboard', { 
      user: req.user || { email: 'ejecutivo@sucursal.com' }, 
      error: 'Error al cargar el panel.' 
    });
  }
};

// 2. Mostrar formulario de nuevo cliente
exports.renderNewClient = (req, res) => {
  res.render('new-client', { error: null, success: null });
};

// 3. Crear nueva cuenta
exports.createAccount = async (req, res) => {
  const { titular, saldo } = req.body;

  try {
    const centralData = await centralService.createAccount({ titular, saldo });
    const numeroCuentaGenerado = centralData.numero_cuenta || centralData.account_number;

    await supabase
      .from('branch_operations')
      .insert([
        {
          operation_type: 'apertura',
          account_number: String(numeroCuentaGenerado),
          amount: Number(saldo),
          status: 'SUCCESS'
        }
      ]);

    res.render('new-client', { 
      success: `Cuenta creada exitosamente. Número asignado: ${numeroCuentaGenerado}`,
      error: null
    });

  } catch (error) {
    console.error('Error al crear cuenta:', error.response?.data || error.message);
    res.render('new-client', { 
      error: 'No se pudo crear la cuenta en la Central.',
      success: null
    });
  }
};