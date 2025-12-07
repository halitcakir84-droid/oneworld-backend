const { pool } = require('../config/database');

/**
 * Settings Controller
 * Handles all settings-related API endpoints
 */

/**
 * Get all settings (features, texts, theme, navigation)
 */
const getAllSettings = async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      // Get feature flags
      const featuresResult = await client.query(`
        SELECT key, enabled 
        FROM feature_flags 
        ORDER BY key;
      `);
      
      const features = {};
      featuresResult.rows.forEach(row => {
        features[row.key] = row.enabled;
      });
      
      // Get app texts (German only for now)
      const textsResult = await client.query(`
        SELECT key, value 
        FROM app_texts 
        WHERE language = 'de'
        ORDER BY key;
      `);
      
      const texts = {};
      textsResult.rows.forEach(row => {
        texts[row.key] = row.value;
      });
      
      // Get active theme
      const themeResult = await client.query(`
        SELECT 
          name,
          primary_color,
          secondary_color,
          accent_color,
          background_color,
          text_color,
          button_color,
          success_color,
          error_color,
          warning_color
        FROM theme_settings 
        WHERE is_active = true 
        LIMIT 1;
      `);
      
      const theme = themeResult.rows[0] || {
        name: 'default',
        primary_color: '#4A90E2',
        secondary_color: '#764ba2',
        accent_color: '#5CB85C',
        background_color: '#FFFFFF',
        text_color: '#333333',
        button_color: '#4A90E2',
        success_color: '#5CB85C',
        error_color: '#DC3545',
        warning_color: '#FFC107'
      };
      
      // Get navigation tabs
      const navigationResult = await client.query(`
        SELECT 
          key,
          title,
          icon,
          route,
          display_order,
          enabled,
          requires_auth
        FROM navigation_tabs 
        WHERE enabled = true
        ORDER BY display_order;
      `);
      
      const navigation = navigationResult.rows;
      
      // Return all settings
      res.json({
        features,
        texts,
        theme,
        navigation
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch settings',
      message: error.message 
    });
  }
};

/**
 * Get feature flags only
 */
const getFeatures = async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT key, name, enabled, category 
        FROM feature_flags 
        ORDER BY category, key;
      `);
      
      res.json({ features: result.rows });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ 
      error: 'Failed to fetch features',
      message: error.message 
    });
  }
};

/**
 * Get app texts only
 */
const getTexts = async (req, res) => {
  try {
    const language = req.query.lang || 'de';
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT key, value, category 
        FROM app_texts 
        WHERE language = $1
        ORDER BY category, key;
      `, [language]);
      
      res.json({ texts: result.rows });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching texts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch texts',
      message: error.message 
    });
  }
};

/**
 * Get theme only
 */
const getTheme = async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM theme_settings 
        WHERE is_active = true 
        LIMIT 1;
      `);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'No active theme found' 
        });
      }
      
      res.json({ theme: result.rows[0] });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ 
      error: 'Failed to fetch theme',
      message: error.message 
    });
  }
};

/**
 * Get navigation tabs only
 */
const getNavigation = async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM navigation_tabs 
        WHERE enabled = true
        ORDER BY display_order;
      `);
      
      res.json({ navigation: result.rows });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching navigation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch navigation',
      message: error.message 
    });
  }
};

module.exports = {
  getAllSettings,
  getFeatures,
  getTexts,
  getTheme,
  getNavigation
};
