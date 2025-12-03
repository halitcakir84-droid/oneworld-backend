const { Pool } = require('pg');

/**
 * One World Backend - Database Setup Script
 * 
 * Run this ONCE to set up all database tables and seed data
 * 
 * Usage: node setup-db.js
 */

console.log('🌍 One World Backend - Database Setup');
console.log('=====================================\n');

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to database\n');
    
    // ============================================
    // STEP 1: Enable UUID Extension
    // ============================================
    console.log('📦 Step 1: Enabling UUID extension...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    console.log('✅ UUID extension enabled\n');
    
    // ============================================
    // STEP 2: Create Settings Tables
    // ============================================
    console.log('📊 Step 2: Creating settings tables...');
    
    // Feature Flags
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
    console.log('  ✅ Feature flags table created');
    
    // App Texts
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
    console.log('  ✅ App texts table created');
    
    // Theme Settings
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
    console.log('  ✅ Theme settings table created');
    
    // Navigation Tabs
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
    console.log('  ✅ Navigation tabs table created');
    
    // App Config
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
    console.log('  ✅ App config table created\n');
    
    // ============================================
    // STEP 3: Create Core Tables
    // ============================================
    console.log('📊 Step 3: Creating core application tables...');
    
    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    console.log('  ✅ Users table created');
    
    // Votings
    await client.query(`
      CREATE TABLE IF NOT EXISTS votings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Votings table created');
    
    // Voting Projects
    await client.query(`
      CREATE TABLE IF NOT EXISTS voting_projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        voting_id UUID REFERENCES votings(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        vote_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Voting projects table created');
    
    // Votes
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        voting_id UUID REFERENCES votings(id) ON DELETE CASCADE,
        project_id UUID REFERENCES voting_projects(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, voting_id)
      );
    `);
    console.log('  ✅ Votes table created\n');
    
    // ============================================
    // STEP 4: Seed Feature Flags
    // ============================================
    console.log('🌱 Step 4: Seeding feature flags...');
    await client.query(`
      INSERT INTO feature_flags (key, name, description, enabled, category) VALUES
      ('voting_enabled', 'Abstimmungen', 'Aktiviert/Deaktiviert das Abstimmungs-Feature', true, 'features'),
      ('donations_enabled', 'Spenden', 'Aktiviert/Deaktiviert das Spenden-Feature', true, 'features'),
      ('news_enabled', 'Nachrichten', 'Aktiviert/Deaktiviert das News-Feature', true, 'features'),
      ('projects_enabled', 'Projekte', 'Aktiviert/Deaktiviert die Projekt-Übersicht', true, 'features'),
      ('gallery_enabled', 'Galerie', 'Aktiviert/Deaktiviert die Bilder-Galerie', true, 'features'),
      ('partners_enabled', 'Partner', 'Aktiviert/Deaktiviert die Partner-Sektion', true, 'features'),
      ('ads_enabled', 'Werbung', 'Aktiviert/Deaktiviert AdMob Werbung', true, 'monetization'),
      ('push_notifications', 'Push Benachrichtigungen', 'Aktiviert/Deaktiviert Push Notifications', true, 'communication'),
      ('social_sharing', 'Social Media Sharing', 'Aktiviert/Deaktiviert Social Sharing', true, 'features'),
      ('dark_mode', 'Dark Mode', 'Aktiviert/Deaktiviert Dark Mode Option', false, 'ui')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ Feature flags seeded (10 flags)\n');
    
    // ============================================
    // STEP 5: Seed App Texts
    // ============================================
    console.log('🌱 Step 5: Seeding app texts...');
    await client.query(`
      INSERT INTO app_texts (key, language, value, category) VALUES
      ('app_title', 'de', 'One World', 'general'),
      ('app_subtitle', 'de', 'Gemeinsam Gutes tun', 'general'),
      ('welcome_message', 'de', 'Willkommen bei One World!', 'general'),
      ('home_title', 'de', 'Startseite', 'navigation'),
      ('voting_title', 'de', 'Abstimmungen', 'navigation'),
      ('projects_title', 'de', 'Projekte', 'navigation'),
      ('donate_title', 'de', 'Spenden', 'navigation'),
      ('profile_title', 'de', 'Profil', 'navigation'),
      ('vote_button', 'de', 'Abstimmen', 'actions'),
      ('donate_button', 'de', 'Jetzt spenden', 'actions'),
      ('share_button', 'de', 'Teilen', 'actions'),
      ('login_button', 'de', 'Anmelden', 'auth'),
      ('register_button', 'de', 'Registrieren', 'auth'),
      ('logout_button', 'de', 'Abmelden', 'auth')
      ON CONFLICT (key, language) DO NOTHING;
    `);
    console.log('✅ App texts seeded (14 texts)\n');
    
    // ============================================
    // STEP 6: Seed Theme Settings
    // ============================================
    console.log('🌱 Step 6: Seeding theme settings...');
    await client.query(`
      INSERT INTO theme_settings (
        name, is_active, 
        primary_color, secondary_color, accent_color,
        background_color, text_color, button_color,
        success_color, error_color, warning_color
      ) VALUES (
        'default', true,
        '#4A90E2', '#764ba2', '#5CB85C',
        '#FFFFFF', '#333333', '#4A90E2',
        '#5CB85C', '#DC3545', '#FFC107'
      )
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Theme settings seeded\n');
    
    // ============================================
    // STEP 7: Seed Navigation Tabs
    // ============================================
    console.log('🌱 Step 7: Seeding navigation tabs...');
    await client.query(`
      INSERT INTO navigation_tabs (key, title, icon, route, display_order, enabled) VALUES
      ('home', 'Home', 'home', '/', 1, true),
      ('voting', 'Abstimmen', 'vote', '/voting', 2, true),
      ('projects', 'Projekte', 'folder', '/projects', 3, true),
      ('donate', 'Spenden', 'heart', '/donate', 4, true),
      ('profile', 'Profil', 'user', '/profile', 5, true)
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ Navigation tabs seeded (5 tabs)\n');
    
    // ============================================
    // STEP 8: Create Admin User
    // ============================================
    console.log('👤 Step 8: Creating admin user...');
    await client.query(`
      INSERT INTO users (
        email, 
        password_hash, 
        username, 
        first_name, 
        last_name, 
        role, 
        is_active, 
        email_verified
      ) VALUES (
        'admin@oneworld.com',
        '$2b$10$rBV2KXZqJZfL6Kp0Y.nLWeBqmxJE8LZP7YL5z.Q0qUXNhE8oE8C4G',
        'admin',
        'Admin',
        'User',
        'admin',
        true,
        true
      )
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✅ Admin user created');
    console.log('   📧 Email: admin@oneworld.com');
    console.log('   🔑 Password: admin123\n');
    
    // ============================================
    // VERIFICATION
    // ============================================
    console.log('🔍 Verification...');
    
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`✅ Created ${tables.rows.length} tables`);
    
    const flagsCount = await client.query(`SELECT COUNT(*) FROM feature_flags;`);
    console.log(`✅ ${flagsCount.rows[0].count} feature flags`);
    
    const textsCount = await client.query(`SELECT COUNT(*) FROM app_texts;`);
    console.log(`✅ ${textsCount.rows[0].count} app texts`);
    
    const usersCount = await client.query(`SELECT COUNT(*) FROM users WHERE role = 'admin';`);
    console.log(`✅ ${usersCount.rows[0].count} admin user(s)\n`);
    
    console.log('=====================================');
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('=====================================\n');
    console.log('Your backend is ready to use!');
    console.log('Test it at: https://oneworld-backend.onrender.com/api/v1/settings\n');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('✅ Setup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup script failed:', error);
    process.exit(1);
  });
