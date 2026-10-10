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