-- backend/src/database/migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (subscription-ready)
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255), -- null for Google OAuth users
                       google_id VARCHAR(255) UNIQUE,
                       first_name VARCHAR(100),
                       last_name VARCHAR(100),
                       profile_image VARCHAR(500),
                       country_code VARCHAR(2) DEFAULT 'US',
                       timezone VARCHAR(50) DEFAULT 'GMT',
                       subscription_tier VARCHAR(20) DEFAULT 'free', -- for future use
                       ai_generations_used INTEGER DEFAULT 0,
                       ai_generations_limit INTEGER DEFAULT 5,
                       ai_reset_date DATE DEFAULT CURRENT_DATE,
                       is_active BOOLEAN DEFAULT true,
                       tour_completed BOOLEAN DEFAULT false,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social accounts/channels
CREATE TABLE social_accounts (
                                 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                 platform VARCHAR(20) NOT NULL, -- 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'
                                 account_name VARCHAR(255) NOT NULL,
                                 account_id VARCHAR(255) NOT NULL, -- platform-specific account ID
                                 account_username VARCHAR(255),
                                 account_avatar VARCHAR(500),
                                 access_token TEXT NOT NULL,
                                 refresh_token TEXT,
                                 token_expires_at TIMESTAMP,
                                 is_active BOOLEAN DEFAULT true,
                                 account_type VARCHAR(20) DEFAULT 'personal', -- 'personal', 'business', 'page'
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 UNIQUE(platform, account_id, user_id)
);

-- Posts table (supports all content types)
CREATE TABLE posts (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       title VARCHAR(500),
                       content TEXT,
                       status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
                       post_type VARCHAR(20) NOT NULL, -- 'text', 'image', 'video', 'carousel', 'reel', 'short'
                       scheduled_at TIMESTAMP,
                       published_at TIMESTAMP,
                       is_ai_generated BOOLEAN DEFAULT false,
                       ai_prompt TEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post targets (which social accounts to post to)
CREATE TABLE post_targets (
                              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                              social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
                              platform_post_id VARCHAR(255), -- ID returned by social platform after posting
                              status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'published', 'failed'
                              error_message TEXT,
                              published_at TIMESTAMP,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              UNIQUE(post_id, social_account_id)
);

-- Media files
CREATE TABLE media_files (
                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                             file_name VARCHAR(255) NOT NULL,
                             file_path VARCHAR(500) NOT NULL,
                             file_type VARCHAR(50) NOT NULL, -- 'image/jpeg', 'video/mp4', etc.
                             file_size INTEGER NOT NULL,
                             file_order INTEGER DEFAULT 0, -- for carousel posts
                             thumbnail_path VARCHAR(500),
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events/holidays table
CREATE TABLE events (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        event_date DATE NOT NULL,
                        event_type VARCHAR(50) DEFAULT 'holiday', -- 'holiday', 'observance', 'seasonal'
                        country_code VARCHAR(2) NOT NULL,
                        is_recurring BOOLEAN DEFAULT true, -- yearly recurring
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled jobs tracking
CREATE TABLE scheduled_jobs (
                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                job_type VARCHAR(50) NOT NULL, -- 'post_publish', 'monthly_email', 'token_refresh'
                                job_data JSONB NOT NULL,
                                job_id VARCHAR(255) UNIQUE, -- BullMQ job ID
                                status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
                                scheduled_at TIMESTAMP NOT NULL,
                                processed_at TIMESTAMP,
                                error_message TEXT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_post_targets_post_id ON post_targets(post_id);
CREATE INDEX idx_post_targets_social_account_id ON post_targets(social_account_id);
CREATE INDEX idx_media_files_post_id ON media_files(post_id);
CREATE INDEX idx_events_country_code ON events(country_code);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_scheduled_jobs_status ON scheduled_jobs(status);
CREATE INDEX idx_scheduled_jobs_scheduled_at ON scheduled_jobs(scheduled_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_post_targets_updated_at BEFORE UPDATE ON post_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();