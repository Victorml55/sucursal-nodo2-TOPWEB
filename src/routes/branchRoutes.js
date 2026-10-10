const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// Rutas de Autenticación
router.get('/login', branchController.getLogin);
router.post('/login', branchController.postLogin);
router.get('/logout', branchController.logout);

// Rutas de Operación del Dashboard
router.get('/', branchController.getDashboard);
router.get('/dashboard', branchController.getDashboard);

// Rutas de Alta de Clientes
router.get('/new-client', branchController.getNewClient);
router.post('/create-account', branchController.createAccount);

module.exports = router;