const axios = require('axios');

const centralClient = axios.create({
  baseURL: process.env.CENTRAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.CENTRAL_API_KEY
  }
});

// 1. Obtener información de tu cajero/nodo y el efectivo oficial
exports.getNodeInfo = async () => {
  const response = await centralClient.get('/api/node/me');
  return response.data; // Retorna info del cajero y 'efectivo_nodo'
};

// 2. Consultar información de una cuenta
exports.getAccount = async (numeroCuenta) => {
  const response = await centralClient.get(`/api/accounts/${numeroCuenta}`);
  return response.data;
};

// 3. Realizar un Retiro
exports.withdraw = async (numeroCuenta, monto) => {
  const response = await centralClient.post('/api/withdraw', {
    numero_cuenta: numeroCuenta,
    monto: Number(monto)
  });
  return response.data; // Devuelve confirmación y el nuevo 'efectivo_nodo'
};

// 4. Realizar un Depósito
exports.deposit = async (numeroCuenta, monto) => {
  const response = await centralClient.post('/api/deposit', {
    numero_cuenta: numeroCuenta,
    monto: Number(monto)
  });
  return response.data; // Devuelve confirmación y el nuevo 'efectivo_nodo'
};