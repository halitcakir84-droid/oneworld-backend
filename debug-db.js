const { Pool } = require('pg');

/**
 * Database Debug Script
 * Checks what's actually in the database
 */

console.log('🔍 One World Backend - Database Debug');
console.log('=====================================\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function debugDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to database\n');
    
    // Check all tables
    console.log('📊 Checking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    console.log('');
    
    // Check feature_flags
    console.log('🚩 Checking feature_flags...');
    const flags = await client.query(`SELECT * FROM feature_flags LIMIT 5;`);
    console.log(`Found ${flags.rows.length} feature flags (showing first 5):`);
    flags.rows.forEach(flag => console.log(`  - ${flag.key}: ${flag.enabled}`));
    console.log('');
    
    // Check app_texts
    console.log('📝 Checking app_texts...');
    const texts = await client.query(`SELECT * FROM app_texts LIMIT 5;`);
    console.log(`Found ${texts.rows.length} app texts (showing first 5):`);
    texts.rows.forEach(text => console.log(`  - ${text.key}: ${text.value}`));
    console.log('');
    
    // Check theme_settings
    console.log('🎨 Checking theme_settings...');
    const themes = await client.query(`SELECT * FROM theme_settings;`);
    console.log(`Found ${themes.rows.length} themes:`);
    themes.rows.forEach(theme => console.log(`  - ${theme.name} (active: ${theme.is_active})`));
    console.log('');
    
    // Check navigation_tabs
    console.log('🧭 Checking navigation_tabs...');
    const tabs = await client.query(`SELECT * FROM navigation_tabs ORDER BY display_order;`);
    console.log(`Found ${tabs.rows.length} navigation tabs:`);
    tabs.rows.forEach(tab => console.log(`  - ${tab.key}: ${tab.title}`));
    console.log('');
    
    // Check users
    console.log('👤 Checking users...');
    const users = await client.query(`SELECT email, username, role FROM users;`);
    console.log(`Found ${users.rows.length} users:`);
    users.rows.forEach(user => console.log(`  - ${user.email} (${user.role})`));
    console.log('');
    
    // Count all data
    const flagCount = await client.query(`SELECT COUNT(*) FROM feature_flags;`);
    const textCount = await client.query(`SELECT COUNT(*) FROM app_texts;`);
    const themeCount = await client.query(`SELECT COUNT(*) FROM theme_settings;`);
    const tabCount = await client.query(`SELECT COUNT(*) FROM navigation_tabs;`);
    const userCount = await client.query(`SELECT COUNT(*) FROM users;`);
    
    console.log('📊 Summary:');
    console.log(`  Feature Flags: ${flagCount.rows[0].count}`);
    console.log(`  App Texts: ${textCount.rows[0].count}`);
    console.log(`  Themes: ${themeCount.rows[0].count}`);
    console.log(`  Navigation Tabs: ${tabCount.rows[0].count}`);
    console.log(`  Users: ${userCount.rows[0].count}`);
    console.log('');
    
    console.log('✅ Database check complete!\n');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

debugDatabase()
  .then(() => {
    console.log('✅ Debug script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug script failed:', error);
    process.exit(1);
  });
