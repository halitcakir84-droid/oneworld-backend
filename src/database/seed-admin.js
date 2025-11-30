const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

/**
 * Seed Admin User
 * 
 * Creates a default admin account for accessing the admin panel
 */

const seedAdminUser = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('🌱 Seeding admin user...');
    
    const email = 'admin@oneworld.com';
    const password = 'admin123'; // CHANGE THIS IN PRODUCTION!
    const name = 'Admin';
    
    // Check if admin already exists
    const existing = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existing.rows.length > 0) {
      logger.info('⚠️  Admin user already exists, skipping...');
      return;
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create admin user
    await client.query(`
      INSERT INTO users (
        email,
        password_hash,
        name,
        role,
        email_verified,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [email, password_hash, name, 'admin', true]);
    
    logger.info('✅ Admin user created successfully!');
    logger.info('');
    logger.info('========================================');
    logger.info('📧 Email:    admin@oneworld.com');
    logger.info('🔑 Password: admin123');
    logger.info('🌐 Login:    http://localhost:3000/admin');
    logger.info('========================================');
    logger.info('');
    logger.info('⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    logger.error('❌ Admin user seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run seed if called directly
if (require.main === module) {
  seedAdminUser()
    .then(() => {
      logger.info('Admin user seed completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Admin user seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAdminUser };
