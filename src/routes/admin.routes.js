const express = require('express');
const path = require('path');
const router = express.Router();
const {
  requireAdminSession,
  handleAdminLogin,
  handleAdminLogout,
  getCurrentAdmin,
} = require('../middleware/adminSession');

// Serve static admin pages
const adminPagesPath = path.join(__dirname, '../admin-pages');

// ========== PUBLIC ROUTES (NO AUTH) ==========

// Login page
router.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session && req.session.adminUser) {
    return res.redirect('/admin/dashboard');
  }
  
  res.sendFile(path.join(adminPagesPath, 'login.html'));
});

// Login API
router.post('/api/login', handleAdminLogin);

// ========== PROTECTED ROUTES (REQUIRE AUTH) ==========

// Logout
router.post('/api/logout', requireAdminSession, handleAdminLogout);
router.get('/logout', requireAdminSession, handleAdminLogout);

// Current user
router.get('/api/user', requireAdminSession, getCurrentAdmin);

// Dashboard
router.get('/dashboard', requireAdminSession, (req, res) => {
  res.sendFile(path.join(adminPagesPath, 'dashboard.html'));
});

// Settings
router.get('/settings', requireAdminSession, (req, res) => {
  res.sendFile(path.join(adminPagesPath, 'settings.html'));
});

// Votings
router.get('/votings', requireAdminSession, (req, res) => {
  res.sendFile(path.join(adminPagesPath, 'votings.html'));
});

// Projects
router.get('/projects', requireAdminSession, (req, res) => {
  res.sendFile(path.join(adminPagesPath, 'projects.html'));
});

// Users
router.get('/users', requireAdminSession, (req, res) => {
  res.sendFile(path.join(adminPagesPath, 'users.html'));
});

// Default redirect
router.get('/', (req, res) => {
  if (req.session && req.session.adminUser) {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/admin/login');
});

module.exports = router;
