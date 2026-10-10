const axios = require('axios');

const centralClient = axios.create({
  baseURL: process.env.CENTRAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.CENTRAL_API_KEY
  }
});


const MOCK_MODE = false;

// 1. Obtener información del nodo
exports.getNodeInfo = async () => {
  if (MOCK_MODE) {
    return { id: 'nodo-2', nombre: 'Sucursal Norte', tipo: 'sucursal', estado: 'activo', efectivo_disponible: 10000 };
  }
  const response = await centralClient.get('/api/node/me');
  return response.data;
};

// 2. Consultar cuenta
exports.getAccount = async (numeroCuenta) => {
  const response = await centralClient.get(`/api/accounts/${numeroCuenta}`);
  return response.data;
};

// 3. Retiro
exports.withdraw = async (numeroCuenta, monto) => {
  const response = await centralClient.post('/api/withdraw', {
    numero_cuenta: numeroCuenta,
    monto: Number(monto)
  });
  return response.data;
};

// 4. Depósito
exports.deposit = async (numeroCuenta, monto) => {
  const response = await centralClient.post('/api/deposit', {
    numero_cuenta: numeroCuenta,
    monto: Number(monto)
  });
  return response.data;
};

// 5. Crear cuenta (Con respuesta simulada exacta del contrato de la Central)
exports.createAccount = async (data) => {
  const titular = String(data.titular || data.nombre || '').trim();
  const saldo = Number(data.saldo_inicial ?? data.saldo ?? 0);

  if (MOCK_MODE) {
    console.log('>>> [MOCK ACTIVADO] Simulando creación exitosa en Central...');
    console.log('>>> Datos recibidos:', { titular, saldo });

    // Simula la estructura exacta '201 Created' que devolverá el Banco Central
    return {
      cuenta: {
        numero_cuenta: '1000000999',
        titular: titular,
        saldo: saldo,
        estado: 'activa'
      },
      transaccion: {
        id: 999,
        tipo: 'deposito',
        numero_cuenta: '1000000999',
        monto: saldo,
        created_at: new Date().toISOString()
      },
      efectivo_nodo: 11000.00
    };
  }

  // Petición real a la Central
  const response = await centralClient.post('/api/accounts', {
    titular: titular,
    saldo_inicial: saldo
  });
  return response.data;
};

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
        { id: 6, tipo: 'deposito', monto: 9999.00, node_id: 2, created_at: new Date().toISOString() },
        { id: 2, tipo: 'retiro', monto: 500.00, node_id: 1, created_at: new Date(Date.now() - 86400000).toISOString() }
      ]
    };
  }

  // Petición real a la API Central
  const response = await axios.get(`${CENTRAL_URL}/api/accounts/${numero_cuenta}`, {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};