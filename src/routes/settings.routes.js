const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

/**
 * @route   GET /api/v1/settings
 * @desc    Get all settings
 * @access  Public
 */
router.get('/', settingsController.getAllSettings);

/**
 * @route   GET /api/v1/settings/features
 * @desc    Get feature flags
 * @access  Public
 */
router.get('/features', settingsController.getFeatures);

/**
 * @route   GET /api/v1/settings/texts
 * @desc    Get app texts
 * @access  Public
 */
router.get('/texts', settingsController.getTexts);

/**
 * @route   GET /api/v1/settings/theme
 * @desc    Get theme settings
 * @access  Public
 */
router.get('/theme', settingsController.getTheme);

/**
 * @route   GET /api/v1/settings/navigation
 * @desc    Get navigation tabs
 * @access  Public
 */
router.get('/navigation', settingsController.getNavigation);

module.exports = router;
