const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Seed initial settings data
 */

const seedSettings = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('🌱 Seeding settings data...');
    
    // Feature Flags
    await client.query(`
      INSERT INTO feature_flags (key, name, description, enabled, category) VALUES
      ('enable_voting', 'Abstimmungen', 'Aktiviert das Abstimmungs-Feature', true, 'features'),
      ('enable_donations', 'Spenden', 'Aktiviert das Spenden-Feature', true, 'features'),
      ('enable_leaderboard', 'Leaderboard', 'Zeigt Rangliste der aktivsten User', true, 'features'),
      ('enable_achievements', 'Erfolge', 'Aktiviert Erfolge und Badges', false, 'features'),
      ('enable_dark_mode', 'Dark Mode', 'Ermöglicht dunkles Theme', true, 'ui'),
      ('enable_notifications', 'Push Benachrichtigungen', 'Erlaubt Push Notifications', true, 'notifications'),
      ('enable_social_share', 'Social Sharing', 'Teilen-Funktion für Projekte', true, 'social'),
      ('enable_google_signin', 'Google Login', 'Login mit Google Account', true, 'auth'),
      ('enable_facebook_signin', 'Facebook Login', 'Login mit Facebook Account', true, 'auth'),
      ('enable_apple_signin', 'Apple Login', 'Login mit Apple ID', true, 'auth'),
      ('maintenance_mode', 'Wartungsmodus', 'App in Wartung', false, 'system')
      ON CONFLICT (key) DO NOTHING;
    `);
    
    // App Texts (German)
    await client.query(`
      INSERT INTO app_texts (key, language, value, category, description) VALUES
      -- Welcome & General
      ('welcome_title', 'de', 'Willkommen bei One World', 'general', 'Begrüßungstitel'),
      ('welcome_subtitle', 'de', 'Gemeinsam Gutes tun', 'general', 'Begrüßungsuntertitel'),
      ('app_slogan', 'de', 'Mit deiner Hilfe setzen wir humanitäre Projekte weltweit um', 'general', 'App Slogan'),
      
      -- Buttons
      ('btn_vote', 'de', 'Abstimmen', 'buttons', 'Abstimmungs-Button'),
      ('btn_donate', 'de', 'Jetzt spenden', 'buttons', 'Spenden-Button'),
      ('btn_login', 'de', 'Anmelden', 'buttons', 'Login-Button'),
      ('btn_register', 'de', 'Registrieren', 'buttons', 'Registrierungs-Button'),
      ('btn_cancel', 'de', 'Abbrechen', 'buttons', 'Abbrechen-Button'),
      ('btn_save', 'de', 'Speichern', 'buttons', 'Speichern-Button'),
      ('btn_submit', 'de', 'Absenden', 'buttons', 'Absenden-Button'),
      ('btn_continue', 'de', 'Weiter', 'buttons', 'Weiter-Button'),
      
      -- Navigation
      ('nav_home', 'de', 'Startseite', 'navigation', 'Home Tab'),
      ('nav_voting', 'de', 'Abstimmung', 'navigation', 'Voting Tab'),
      ('nav_projects', 'de', 'Projekte', 'navigation', 'Projekte Tab'),
      ('nav_donate', 'de', 'Spenden', 'navigation', 'Spenden Tab'),
      ('nav_profile', 'de', 'Profil', 'navigation', 'Profil Tab'),
      
      -- Voting
      ('voting_title', 'de', 'Projekt-Abstimmung', 'voting', 'Abstimmungs-Titel'),
      ('voting_subtitle', 'de', 'Welches Projekt soll als nächstes starten?', 'voting', 'Abstimmungs-Frage'),
      ('voting_success', 'de', 'Deine Stimme wurde gezählt!', 'voting', 'Erfolgsmeldung'),
      ('voting_already_voted', 'de', 'Du hast bereits abgestimmt', 'voting', 'Bereits abgestimmt'),
      ('voting_closed', 'de', 'Abstimmung beendet', 'voting', 'Abstimmung beendet'),
      ('voting_time_left', 'de', 'Noch {days} Tage', 'voting', 'Verbleibende Zeit'),
      ('voting_no_active', 'de', 'Keine aktive Abstimmung', 'voting', 'Keine Abstimmung'),
      ('voting_info', 'de', 'Du hast 1 Stimme pro Monat', 'voting', 'Info-Text'),
      
      -- Projects
      ('projects_title', 'de', 'Unsere Projekte', 'projects', 'Projekte-Titel'),
      ('projects_goal', 'de', 'Ziel:', 'projects', 'Spendenziel Label'),
      ('projects_collected', 'de', 'Gesammelt:', 'projects', 'Gesammelt Label'),
      ('projects_supporters', 'de', 'Unterstützer', 'projects', 'Unterstützer'),
      
      -- Donations
      ('donate_title', 'de', 'Spenden', 'donations', 'Spenden-Titel'),
      ('donate_amount', 'de', 'Betrag wählen', 'donations', 'Betrag wählen'),
      ('donate_custom', 'de', 'Eigener Betrag', 'donations', 'Eigener Betrag'),
      ('donate_message', 'de', 'Nachricht (optional)', 'donations', 'Nachricht'),
      ('donate_anonymous', 'de', 'Anonym spenden', 'donations', 'Anonym'),
      ('donate_success', 'de', 'Vielen Dank für deine Spende!', 'donations', 'Erfolg'),
      
      -- Messages
      ('msg_loading', 'de', 'Lädt...', 'messages', 'Laden'),
      ('msg_error', 'de', 'Ein Fehler ist aufgetreten', 'messages', 'Fehler'),
      ('msg_success', 'de', 'Erfolgreich!', 'messages', 'Erfolg'),
      ('msg_network_error', 'de', 'Keine Internetverbindung', 'messages', 'Netzwerkfehler'),
      
      -- Empty States
      ('empty_voting', 'de', 'Aktuell läuft keine Projekt-Abstimmung', 'empty', 'Keine Abstimmung'),
      ('empty_projects', 'de', 'Keine Projekte gefunden', 'empty', 'Keine Projekte'),
      ('empty_donations', 'de', 'Du hast noch nicht gespendet', 'empty', 'Keine Spenden')
      
      ON CONFLICT (key, language) DO NOTHING;
    `);
    
    // App Texts (English)
    await client.query(`
      INSERT INTO app_texts (key, language, value, category) VALUES
      ('welcome_title', 'en', 'Welcome to One World', 'general'),
      ('welcome_subtitle', 'en', 'Making a difference together', 'general'),
      ('btn_vote', 'en', 'Vote', 'buttons'),
      ('btn_donate', 'en', 'Donate now', 'buttons'),
      ('voting_title', 'en', 'Project Voting', 'voting'),
      ('voting_subtitle', 'en', 'Which project should start next?', 'voting'),
      ('voting_success', 'en', 'Your vote has been counted!', 'voting')
      ON CONFLICT (key, language) DO NOTHING;
    `);
    
    // Default Theme
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
    
    // Christmas Theme (example)
    await client.query(`
      INSERT INTO theme_settings (
        name, is_active,
        primary_color, secondary_color, accent_color,
        background_color, text_color, button_color
      ) VALUES (
        'christmas', false,
        '#C41E3A', '#165B33', '#FFD700',
        '#F5F5F5', '#2C3E50', '#C41E3A'
      )
      ON CONFLICT (name) DO NOTHING;
    `);
    
    // Navigation Tabs
    await client.query(`
      INSERT INTO navigation_tabs (key, title, icon, route, display_order, enabled, requires_auth) VALUES
      ('home', 'Startseite', 'home', '/', 1, true, false),
      ('voting', 'Abstimmung', 'ballot', '/voting', 2, true, false),
      ('projects', 'Projekte', 'folder', '/projects', 3, true, false),
      ('donate', 'Spenden', 'favorite', '/donate', 4, true, false),
      ('profile', 'Profil', 'person', '/profile', 5, true, true)
      ON CONFLICT (key) DO NOTHING;
    `);
    
    // App Configuration
    await client.query(`
      INSERT INTO app_config (key, value, category, description, is_public) VALUES
      (
        'app_info',
        '{"name": "One World", "version": "1.0.0", "support_email": "support@oneworld.org"}',
        'general',
        'App Informationen',
        true
      ),
      (
        'donation_amounts',
        '{"preset_amounts": [5, 10, 25, 50, 100], "currency": "EUR", "min_amount": 1, "max_amount": 10000}',
        'donations',
        'Vordefinierte Spendenbeträge',
        true
      ),
      (
        'voting_rules',
        '{"votes_per_user": 1, "min_options": 2, "max_options": 5, "vote_period_days": 30}',
        'voting',
        'Abstimmungs-Regeln',
        true
      ),
      (
        'social_links',
        '{"facebook": "https://facebook.com/oneworld", "instagram": "https://instagram.com/oneworld", "twitter": "https://twitter.com/oneworld"}',
        'social',
        'Social Media Links',
        true
      ),
      (
        'contact_info',
        '{"email": "info@oneworld.org", "phone": "+49 123 456 7890", "address": "Musterstraße 123, 12345 Berlin"}',
        'contact',
        'Kontaktinformationen',
        true
      ),
      (
        'legal_urls',
        '{"privacy_policy": "https://oneworld.org/privacy", "terms_of_service": "https://oneworld.org/terms", "imprint": "https://oneworld.org/imprint"}',
        'legal',
        'Rechtliche URLs',
        true
      )
      ON CONFLICT (key) DO NOTHING;
    `);
    
    logger.info('✅ Settings data seeded successfully!');
    
  } catch (error) {
    logger.error('❌ Settings seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run seed if called directly
if (require.main === module) {
  seedSettings()
    .then(() => {
      logger.info('Settings seed completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Settings seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSettings };
