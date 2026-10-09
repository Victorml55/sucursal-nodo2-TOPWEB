const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware); // Protege todas las rutas de este archivo

router.get('/dashboard', branchController.renderDashboard);
router.get('/accounts/new', branchController.renderNewClient);
router.post('/accounts/new', branchController.createAccount);

module.exports = router;