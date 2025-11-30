const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const settingsController = require('../controllers/settings.controller');

// ========== PUBLIC ROUTES ==========

// Get all settings (features, texts, theme, navigation, config)
router.get('/', settingsController.getAllSettings);

// Get specific settings
router.get('/features', settingsController.getFeatureFlags);
router.get('/texts', settingsController.getAppTexts);
router.get('/theme', settingsController.getTheme);
router.get('/navigation', settingsController.getNavigation);
router.get('/config', settingsController.getAppConfig);

// ========== ADMIN ROUTES ==========

// Feature Flags
router.put('/features/:key', authenticate, isAdmin, settingsController.updateFeatureFlag);

// App Texts
router.put('/texts/:key', authenticate, isAdmin, settingsController.updateAppText);
router.post('/texts/bulk', authenticate, isAdmin, settingsController.bulkUpdateTexts);

// Theme
router.get('/themes', authenticate, isAdmin, settingsController.getAllThemes);
router.put('/theme/:id', authenticate, isAdmin, settingsController.updateTheme);
router.post('/theme/:id/activate', authenticate, isAdmin, settingsController.activateTheme);

// Navigation
router.put('/navigation/:id', authenticate, isAdmin, settingsController.updateNavigationTab);

// App Config
router.put('/config/:key', authenticate, isAdmin, settingsController.updateAppConfig);

module.exports = router;
