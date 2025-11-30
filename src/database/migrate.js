const { pool } = require('../config/database');
const logger = require('../utils/logger');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('🔄 Starting database migration...');
    
    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        name VARCHAR(255),
        firebase_uid VARCHAR(255) UNIQUE,
        profile_picture VARCHAR(500),
        role VARCHAR(50) DEFAULT 'user',
        email_verified BOOLEAN DEFAULT false,
        total_donations DECIMAL(10, 2) DEFAULT 0,
        total_ad_views INTEGER DEFAULT 0,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    
    // News table
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(500) NOT NULL,
        url VARCHAR(1000) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        published_date DATE DEFAULT CURRENT_DATE,
        is_active BOOLEAN DEFAULT true,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        goal_amount DECIMAL(10, 2) NOT NULL,
        current_amount DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'planned',
        location VARCHAR(255),
        category VARCHAR(100),
        start_date DATE,
        end_date DATE,
        image_url VARCHAR(500),
        is_featured BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Donations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        project_id UUID REFERENCES projects(id),
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        is_anonymous BOOLEAN DEFAULT false,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Ad views table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ad_views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        ad_type VARCHAR(50) DEFAULT 'rewarded_video',
        revenue_generated DECIMAL(10, 4) DEFAULT 0.05,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Votings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS votings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'upcoming',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Voting options table
    await client.query(`
      CREATE TABLE IF NOT EXISTS voting_options (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        voting_id UUID REFERENCES votings(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id),
        votes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // User votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        voting_id UUID REFERENCES votings(id) ON DELETE CASCADE,
        option_id UUID REFERENCES voting_options(id) ON DELETE CASCADE,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, voting_id)
      );
    `);
    
    // Partners table
    await client.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(500) NOT NULL,
        website VARCHAR(500),
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Gallery table (completed projects)
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID REFERENCES projects(id),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        completed_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Gallery images table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        gallery_id UUID REFERENCES gallery(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Videos table (Die Idee)
    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'idea',
        video_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        type VARCHAR(50),
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT false,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Push tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        token VARCHAR(500) NOT NULL,
        platform VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
      CREATE INDEX IF NOT EXISTS idx_donations_project_id ON donations(project_id);
      CREATE INDEX IF NOT EXISTS idx_ad_views_user_id ON ad_views(user_id);
      CREATE INDEX IF NOT EXISTS idx_votings_status ON votings(status);
      CREATE INDEX IF NOT EXISTS idx_user_votes_voting_id ON user_votes(voting_id);
    `);
    
    logger.info('✅ Database migration completed successfully!');
    
  } catch (error) {
    logger.error('❌ Database migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      logger.info('Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables };
