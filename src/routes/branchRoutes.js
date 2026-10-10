const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

/**
 * Middleware para verificar si el ejecutivo ha iniciado sesión
 */
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
};

// Rutas Públicas
router.get('/login', branchController.getLogin);
router.post('/login', branchController.postLogin);
router.get('/logout', branchController.logout);

// Rutas Protegidas (Exigen autenticación antes de acceder)
router.get('/', requireAuth, branchController.getDashboard);
router.get('/dashboard', requireAuth, branchController.getDashboard);

router.get('/new-client', requireAuth, branchController.getNewClient);
router.post('/create-account', requireAuth, branchController.createAccount);

router.get('/search-account', requireAuth, branchController.searchAccount);
router.get('/reports', requireAuth, branchController.getReports);

module.exports = router;