const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Admin Session Middleware
 * 
 * Manages admin login sessions for web dashboard
 */

// Session configuration
const sessionConfig = {
  secret: process.env.ADMIN_SESSION_SECRET || 'change-this-in-production-123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
  },
  name: 'oneworld.admin.sid', // Custom session name
};

// Check if user is logged in as admin
const requireAdminSession = (req, res, next) => {
  if (req.session && req.session.adminUser) {
    return next();
  }
  
  // For API calls, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // For web pages, redirect to login
  return res.redirect('/admin/login');
};

// Login handler
const handleAdminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find admin user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, 'admin']
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Create session
    req.session.adminUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    logger.info(`Admin login: ${user.email}`);
    
    res.json({ 
      success: true, 
      redirect: '/admin/dashboard' 
    });
    
  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
};

// Logout handler
const handleAdminLogout = (req, res) => {
  const userEmail = req.session?.adminUser?.email;
  
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destroy error:', err);
    }
    
    logger.info(`Admin logout: ${userEmail}`);
    res.redirect('/admin/login');
  });
};

// Get current admin user
const getCurrentAdmin = (req, res) => {
  if (req.session && req.session.adminUser) {
    return res.json({ user: req.session.adminUser });
  }
  
  res.status(401).json({ error: 'Not authenticated' });
};

module.exports = {
  sessionConfig,
  requireAdminSession,
  handleAdminLogin,
  handleAdminLogout,
  getCurrentAdmin,
};
