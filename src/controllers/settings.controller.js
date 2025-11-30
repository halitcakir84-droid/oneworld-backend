const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Settings Controller
 * 
 * Manages:
 * - Feature flags
 * - App texts/labels
 * - Theme settings
 * - Navigation configuration
 * - General app configuration
 */

// Get all settings (public only for non-admin users)
exports.getAllSettings = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    
    const [features, texts, theme, navigation, config] = await Promise.all([
      db.query('SELECT * FROM feature_flags WHERE enabled = true'),
      db.query('SELECT * FROM app_texts WHERE language = $1', [req.query.lang || 'de']),
      db.query('SELECT * FROM theme_settings WHERE is_active = true LIMIT 1'),
      db.query('SELECT * FROM navigation_tabs WHERE enabled = true ORDER BY display_order'),
      db.query('SELECT * FROM app_config WHERE is_public = true OR $1 = true', [isAdmin])
    ]);
    
    // Transform to key-value format
    const featureFlags = {};
    features.rows.forEach(f => {
      featureFlags[f.key] = f.enabled;
    });
    
    const appTexts = {};
    texts.rows.forEach(t => {
      appTexts[t.key] = t.value;
    });
    
    const appConfig = {};
    config.rows.forEach(c => {
      appConfig[c.key] = c.value;
    });
    
    res.json({
      features: featureFlags,
      texts: appTexts,
      theme: theme.rows[0] || null,
      navigation: navigation.rows,
      config: appConfig,
      version: '1.0.0'
    });
    
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// ========== FEATURE FLAGS ==========

// Get all feature flags
exports.getFeatureFlags = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM feature_flags
      ORDER BY category, name
    `);
    
    // Transform to key-value
    const flags = {};
    result.rows.forEach(f => {
      flags[f.key] = f.enabled;
    });
    
    res.json({ features: flags });
  } catch (error) {
    logger.error('Error fetching feature flags:', error);
    res.status(500).json({ error: 'Failed to fetch feature flags' });
  }
};

// Update feature flag (ADMIN)
exports.updateFeatureFlag = async (req, res) => {
  const { key } = req.params;
  const { enabled } = req.body;
  
  try {
    const result = await db.query(`
      UPDATE feature_flags
      SET enabled = $1, updated_at = CURRENT_TIMESTAMP
      WHERE key = $2
      RETURNING *
    `, [enabled, key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }
    
    logger.info(`Feature flag ${key} updated to ${enabled} by admin ${req.user.id}`);
    res.json({ feature: result.rows[0] });
  } catch (error) {
    logger.error('Error updating feature flag:', error);
    res.status(500).json({ error: 'Failed to update feature flag' });
  }
};

// ========== APP TEXTS ==========

// Get app texts
exports.getAppTexts = async (req, res) => {
  const language = req.query.lang || 'de';
  
  try {
    const result = await db.query(`
      SELECT * FROM app_texts
      WHERE language = $1
      ORDER BY category, key
    `, [language]);
    
    // Transform to key-value
    const texts = {};
    result.rows.forEach(t => {
      texts[t.key] = t.value;
    });
    
    res.json({ texts, language });
  } catch (error) {
    logger.error('Error fetching app texts:', error);
    res.status(500).json({ error: 'Failed to fetch app texts' });
  }
};

// Update app text (ADMIN)
exports.updateAppText = async (req, res) => {
  const { key } = req.params;
  const { value, language = 'de' } = req.body;
  
  try {
    const result = await db.query(`
      UPDATE app_texts
      SET value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE key = $2 AND language = $3
      RETURNING *
    `, [value, key, language]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Text not found' });
    }
    
    logger.info(`App text ${key} (${language}) updated by admin ${req.user.id}`);
    res.json({ text: result.rows[0] });
  } catch (error) {
    logger.error('Error updating app text:', error);
    res.status(500).json({ error: 'Failed to update app text' });
  }
};

// Bulk update app texts (ADMIN)
exports.bulkUpdateTexts = async (req, res) => {
  const { texts, language = 'de' } = req.body;
  
  try {
    const results = [];
    
    for (const [key, value] of Object.entries(texts)) {
      const result = await db.query(`
        UPDATE app_texts
        SET value = $1, updated_at = CURRENT_TIMESTAMP
        WHERE key = $2 AND language = $3
        RETURNING *
      `, [value, key, language]);
      
      if (result.rows.length > 0) {
        results.push(result.rows[0]);
      }
    }
    
    logger.info(`Bulk updated ${results.length} texts by admin ${req.user.id}`);
    res.json({ updated: results.length, texts: results });
  } catch (error) {
    logger.error('Error bulk updating texts:', error);
    res.status(500).json({ error: 'Failed to bulk update texts' });
  }
};

// ========== THEME ==========

// Get active theme
exports.getTheme = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM theme_settings
      WHERE is_active = true
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active theme found' });
    }
    
    res.json({ theme: result.rows[0] });
  } catch (error) {
    logger.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
};

// Get all themes (ADMIN)
exports.getAllThemes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM theme_settings ORDER BY name');
    res.json({ themes: result.rows });
  } catch (error) {
    logger.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
};

// Update theme (ADMIN)
exports.updateTheme = async (req, res) => {
  const { id } = req.params;
  const colors = req.body;
  
  try {
    const result = await db.query(`
      UPDATE theme_settings
      SET 
        primary_color = COALESCE($1, primary_color),
        secondary_color = COALESCE($2, secondary_color),
        accent_color = COALESCE($3, accent_color),
        background_color = COALESCE($4, background_color),
        text_color = COALESCE($5, text_color),
        button_color = COALESCE($6, button_color),
        success_color = COALESCE($7, success_color),
        error_color = COALESCE($8, error_color),
        warning_color = COALESCE($9, warning_color),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [
      colors.primary_color,
      colors.secondary_color,
      colors.accent_color,
      colors.background_color,
      colors.text_color,
      colors.button_color,
      colors.success_color,
      colors.error_color,
      colors.warning_color,
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    logger.info(`Theme ${id} updated by admin ${req.user.id}`);
    res.json({ theme: result.rows[0] });
  } catch (error) {
    logger.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
};

// Activate theme (ADMIN)
exports.activateTheme = async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.transaction(async (client) => {
      // Deactivate all themes
      await client.query('UPDATE theme_settings SET is_active = false');
      
      // Activate selected theme
      const result = await client.query(`
        UPDATE theme_settings
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Theme not found');
      }
      
      return result.rows[0];
    });
    
    logger.info(`Theme ${id} activated by admin ${req.user.id}`);
    res.json({ message: 'Theme activated successfully' });
  } catch (error) {
    logger.error('Error activating theme:', error);
    res.status(500).json({ error: 'Failed to activate theme' });
  }
};

// ========== NAVIGATION ==========

// Get navigation tabs
exports.getNavigation = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM navigation_tabs
      WHERE enabled = true
      ORDER BY display_order
    `);
    
    res.json({ tabs: result.rows });
  } catch (error) {
    logger.error('Error fetching navigation:', error);
    res.status(500).json({ error: 'Failed to fetch navigation' });
  }
};

// Update navigation tab (ADMIN)
exports.updateNavigationTab = async (req, res) => {
  const { id } = req.params;
  const { title, icon, enabled, display_order } = req.body;
  
  try {
    const result = await db.query(`
      UPDATE navigation_tabs
      SET 
        title = COALESCE($1, title),
        icon = COALESCE($2, icon),
        enabled = COALESCE($3, enabled),
        display_order = COALESCE($4, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [title, icon, enabled, display_order, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Navigation tab not found' });
    }
    
    logger.info(`Navigation tab ${id} updated by admin ${req.user.id}`);
    res.json({ tab: result.rows[0] });
  } catch (error) {
    logger.error('Error updating navigation tab:', error);
    res.status(500).json({ error: 'Failed to update navigation tab' });
  }
};

// ========== APP CONFIG ==========

// Get app config
exports.getAppConfig = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    
    const result = await db.query(`
      SELECT * FROM app_config
      WHERE is_public = true OR $1 = true
      ORDER BY category, key
    `, [isAdmin]);
    
    // Transform to key-value
    const config = {};
    result.rows.forEach(c => {
      config[c.key] = c.value;
    });
    
    res.json({ config });
  } catch (error) {
    logger.error('Error fetching app config:', error);
    res.status(500).json({ error: 'Failed to fetch app config' });
  }
};

// Update app config (ADMIN)
exports.updateAppConfig = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  
  try {
    const result = await db.query(`
      UPDATE app_config
      SET value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE key = $2
      RETURNING *
    `, [JSON.stringify(value), key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    
    logger.info(`App config ${key} updated by admin ${req.user.id}`);
    res.json({ config: result.rows[0] });
  } catch (error) {
    logger.error('Error updating app config:', error);
    res.status(500).json({ error: 'Failed to update app config' });
  }
};

module.exports = exports;
