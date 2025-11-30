const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Settings Database Migration
 * 
 * Creates tables for:
 * - Feature Flags
 * - App Texts/Labels
 * - Theme Settings
 * - Navigation Configuration
 */

const createSettingsTables = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('🔄 Creating settings tables...');
    
    // Feature Flags Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        enabled BOOLEAN DEFAULT false,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
      CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
    `);
    
    // App Texts/Labels Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_texts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(100) NOT NULL,
        language VARCHAR(10) DEFAULT 'de',
        value TEXT NOT NULL,
        category VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(key, language)
      );
      
      CREATE INDEX IF NOT EXISTS idx_app_texts_key ON app_texts(key);
      CREATE INDEX IF NOT EXISTS idx_app_texts_language ON app_texts(language);
    `);
    
    // Theme Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS theme_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        primary_color VARCHAR(7) DEFAULT '#4A90E2',
        secondary_color VARCHAR(7) DEFAULT '#764ba2',
        accent_color VARCHAR(7) DEFAULT '#5CB85C',
        background_color VARCHAR(7) DEFAULT '#FFFFFF',
        text_color VARCHAR(7) DEFAULT '#333333',
        button_color VARCHAR(7) DEFAULT '#4A90E2',
        success_color VARCHAR(7) DEFAULT '#5CB85C',
        error_color VARCHAR(7) DEFAULT '#DC3545',
        warning_color VARCHAR(7) DEFAULT '#FFC107',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Navigation Tabs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS navigation_tabs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        route VARCHAR(100) NOT NULL,
        display_order INTEGER DEFAULT 0,
        enabled BOOLEAN DEFAULT true,
        requires_auth BOOLEAN DEFAULT false,
        badge_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_navigation_enabled ON navigation_tabs(enabled);
      CREATE INDEX IF NOT EXISTS idx_navigation_order ON navigation_tabs(display_order);
    `);
    
    // App Configuration Table (general settings)
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_config (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        category VARCHAR(50),
        description TEXT,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);
      CREATE INDEX IF NOT EXISTS idx_app_config_public ON app_config(is_public);
    `);
    
    logger.info('✅ Settings tables created successfully!');
    
  } catch (error) {
    logger.error('❌ Settings tables creation failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration if called directly
if (require.main === module) {
  createSettingsTables()
    .then(() => {
      logger.info('Settings migration completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Settings migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createSettingsTables };
