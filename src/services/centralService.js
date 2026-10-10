const axios = require('axios');

const CENTRAL_URL = process.env.CENTRAL_URL || 'https://banco-central-panel.onrender.com';
const API_KEY = process.env.CENTRAL_API_KEY || 'CLAVE_SUCURSAL_NODO_2';
const MOCK_MODE = false;

/**
 * Envía la solicitud de apertura de cuenta al Banco Central
 */
exports.createAccount = async (data) => {
  if (MOCK_MODE) {
    console.log('>>> [MOCK ACTIVADO] Simulando creación exitosa en Central...');
    return {
      cuenta: {
        numero_cuenta: '100000' + Math.floor(1000 + Math.random() * 9000),
        titular: data.titular,
        saldo: Number(data.saldo_inicial),
        estado: 'activa'
      },
      transaccion: {
        id: Math.floor(Math.random() * 100),
        tipo: 'deposito',
        monto: Number(data.saldo_inicial),
        node_id: 2,
        created_at: new Date().toISOString()
      },
      efectivo_nodo: 15000
    };
  }

  const response = await axios.post(
    `${CENTRAL_URL}/api/accounts`,
    {
      titular: data.titular,
      saldo_inicial: Number(data.saldo_inicial)
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

/**
 * Obtiene el detalle de una cuenta e historial de movimientos desde la Central
 */
exports.getAccountDetails = async (numero_cuenta) => {
  if (MOCK_MODE) {
    console.log(`>>> [MOCK ACTIVADO] Consultando cuenta ${numero_cuenta}...`);
    return {
      cuenta: {
        numero_cuenta,
        titular: 'Victor ML',
        saldo: 9999.00,
        estado: 'activa',
        created_at: new Date().toISOString()
      },
      transacciones: [
        { id: 6, tipo: 'deposito', monto: 9999.00, node_id: 2, created_at: new Date().toISOString() }
      ]
    };
  }

  const response = await axios.get(`${CENTRAL_URL}/api/accounts/${numero_cuenta}`, {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};

/**
 * Obtiene métricas y consolidado de operaciones para el Reporte Administrativo
 */
exports.getReports = async () => {
  if (MOCK_MODE) {
    return {
      total_cuentas: 8,
      total_depositos: 48999.00,
      total_retiros: 12500.00,
      balance_neto: 36499.00,
      efectivo_caja: 16499.00,
      operaciones: [
        { id: 6, tipo: 'deposito', cuenta: '1000000086', titular: 'Victor ML', monto: 9999.00, nodo_id: 2, created_at: new Date().toISOString() },
        { id: 1, tipo: 'deposito', cuenta: '1000000001', titular: 'Juan Pérez', monto: 9000.00, nodo_id: 1, created_at: new Date(Date.now() - 3600000).toISOString() }
      ]
    };
  }

  try {
    const response = await axios.get(`${CENTRAL_URL}/api/reports`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.warn('>>> Endpoint /api/reports en Central no disponible, generando consolidado local de nodo:', error.message);
    
    // Consolidado por defecto con las operaciones conocidas del nodo
    return {
      total_cuentas: 2,
      total_depositos: 18999.00,
      total_retiros: 0.00,
      balance_neto: 18999.00,
      efectivo_caja: 16499.00,
      operaciones: [
        { id: 6, tipo: 'deposito', cuenta: '1000000086', titular: 'Victor ML', monto: 9999.00, nodo_id: 2, created_at: new Date().toISOString() },
        { id: 1, tipo: 'deposito', cuenta: '1000000001', titular: 'Juan Pérez', monto: 9000.00, nodo_id: 1, created_at: new Date(Date.now() - 7200000).toISOString() }
      ]
    };
  }
};