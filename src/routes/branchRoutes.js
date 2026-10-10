const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/dashboard', branchController.renderDashboard);
router.get('/accounts/new', branchController.renderNewClient);

// Asegúrate de que la ruta POST coincida con el action de tu formulario EJS
router.post('/create-account', branchController.createAccount); 
// O si prefieres mantener /accounts/new, cámbialo en el action="" del <form> en new-client.ejs

module.exports = router;