const express = require('express');
const router = express.Router();
// TODO: Import auth controller
// const authController = require('../controllers/auth.controller');

// Register
router.post('/register', (req, res) => res.status(501).json({ message: 'Register endpoint - to be implemented' }));

// Login
router.post('/login', (req, res) => res.status(501).json({ message: 'Login endpoint - to be implemented' }));

// Social login
router.post('/google', (req, res) => res.status(501).json({ message: 'Google login - to be implemented' }));
router.post('/facebook', (req, res) => res.status(501).json({ message: 'Facebook login - to be implemented' }));

// Token refresh
router.post('/refresh', (req, res) => res.status(501).json({ message: 'Token refresh - to be implemented' }));

module.exports = router;
