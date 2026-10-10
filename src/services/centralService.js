const axios = require('axios');

// Definición global de URL y API KEY para todas las funciones del servicio
const CENTRAL_URL = process.env.CENTRAL_URL || 'https://banco-central-panel.onrender.com';
const API_KEY = process.env.CENTRAL_API_KEY || 'CLAVE_SUCURSAL_NODO_2';
const MOCK_MODE = false; // Cambiar a true únicamente si la Central no responde

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