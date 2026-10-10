const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/dashboard', branchController.renderDashboard);

// Acepta la ruta /new-client que usa tu dashboard
router.get('/new-client', branchController.renderNewClient);
router.get('/accounts/new', branchController.renderNewClient); // Aliases de respaldo

// Procesar el envío del formulario
router.post('/create-account', branchController.createAccount); 

module.exports = router;