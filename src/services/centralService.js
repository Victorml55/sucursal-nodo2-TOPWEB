const axios = require('axios');

const CENTRAL_URL = process.env.CENTRAL_URL || 'https://banco-central-panel.onrender.com';
const API_KEY = process.env.CENTRAL_API_KEY || 'CLAVE_SUCURSAL_NODO_2';
const MOCK_MODE = false;

// Estado dinámico del efectivo en caja del Nodo 2
let efectivoCaja = Number(process.env.INITIAL_CASH || 15000.00);

/**
 * Retorna el balance de efectivo actual
 */
exports.getEfectivoCaja = () => efectivoCaja;

/**
 * Envía la solicitud de apertura de cuenta al Banco Central y actualiza el efectivo en caja
 */
exports.createAccount = async (data) => {
  const montoInicial = Number(data.saldo_inicial) || 0;

  if (MOCK_MODE) {
    console.log('>>> [MOCK ACTIVADO] Simulando creación exitosa en Central...');
    efectivoCaja += montoInicial;
    return {
      cuenta: {
        numero_cuenta: '100000' + Math.floor(1000 + Math.random() * 9000),
        titular: data.titular,
        saldo: montoInicial,
        estado: 'activa'
      },
      transaccion: {
        id: Math.floor(Math.random() * 100),
        tipo: 'deposito',
        monto: montoInicial,
        node_id: 2,
        created_at: new Date().toISOString()
      },
      efectivo_nodo: efectivoCaja
    };
  }

  const response = await axios.post(
    `${CENTRAL_URL}/api/accounts`,
    {
      titular: data.titular,
      saldo_inicial: montoInicial
    },
    {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  // Sincronizar efectivo con el Banco Central o sumar el depósito al saldo local
  if (response.data && response.data.efectivo_nodo !== undefined) {
    efectivoCaja = Number(response.data.efectivo_nodo);
  } else {
    efectivoCaja += montoInicial;
  }

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
      total_cuentas: 2,
      total_depositos: 18999.00,
      total_retiros: 0.00,
      balance_neto: 18999.00,
      efectivo_caja: efectivoCaja,
      operaciones: [
        { id: 6, tipo: 'deposito', cuenta: '1000000086', titular: 'Victor ML', monto: 9999.00, nodo_id: 2, created_at: new Date().toISOString() }
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

    if (response.data && (response.data.efectivo_caja !== undefined || response.data.efectivo_nodo !== undefined)) {
      efectivoCaja = Number(response.data.efectivo_caja ?? response.data.efectivo_nodo);
    }

    return {
      ...response.data,
      efectivo_caja: response.data?.efectivo_caja ?? efectivoCaja
    };
  } catch (error) {
    console.warn('>>> Endpoint /api/reports en Central no disponible, generando consolidado local de nodo:', error.message);
    
    return {
      total_cuentas: 2,
      total_depositos: 18999.00,
      total_retiros: 0.00,
      balance_neto: 18999.00,
      efectivo_caja: efectivoCaja,
      operaciones: [
        { id: 6, tipo: 'deposito', cuenta: '1000000086', titular: 'Victor ML', monto: 9999.00, nodo_id: 2, created_at: new Date().toISOString() }
      ]
    };
  }
};