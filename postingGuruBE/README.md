// backend/README.md
# Social Media Scheduler Backend

A comprehensive backend API for managing social media posts across multiple platforms with AI-powered content generation.

## Features

- 🔐 **Authentication**: JWT + Google OAuth
- 📱 **Multi-Platform**: Facebook, Instagram, LinkedIn, TikTok, YouTube
- 🤖 **AI Integration**: OpenAI GPT for content generation
- ⏰ **Scheduling**: Advanced post scheduling with optimal timing
- 📧 **Notifications**: Email alerts and monthly event reminders
- 🔄 **Queue System**: Redis + Bull for reliable job processing
- 📊 **Analytics**: Post performance tracking
- 🌍 **Multi-Country**: Event calendars for different countries
- 🎨 **Media Processing**: Image optimization and thumbnail generation

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache/Queue**: Redis with Bull
- **Authentication**: Passport.js + JWT
- **File Upload**: Multer + Sharp
- **Email**: Nodemailer
- **AI**: OpenAI API
- **Validation**: Express Validator

## Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Redis 6+

### Installation

1. **Clone repository**
```bash
   git clone <repository-url>
   cd social-media-scheduler/backend
   ```

2. **Install dependencies**
```bash
   npm install
   ```

3. **Setup environment**
```bash
   npm run dev:setup
   ```

4. **Configure environment**
   Edit `.env` file with your database and API credentials:
  ```env
   # Database
   DB_HOST=localhost
   DB_NAME=social_scheduler
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # JWT
   JWT_SECRET=your-secret-key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # OpenAI
   OPENAI_API_KEY=your-openai-key
   ```

5. **Setup database**
```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development server**
```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/profile` - Get user profile

### Posts
- `GET /api/posts` - Get user posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/publish` - Publish immediately

### Social Accounts
- `GET /api/social-accounts` - Get connected accounts
- `POST /api/social-accounts` - Add social account
- `DELETE /api/social-accounts/:id` - Remove account

### Dashboard
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/dashboard/events` - Monthly events

### AI
- `POST /api/ai/generate/text` - Generate text content
- `POST /api/ai/generate/image` - Generate images
- `GET /api/ai/usage` - AI usage statistics

## Development Scripts

  ```bash
# Development
npm run dev              # Start with nodemon
npm run dev:setup        # Setup development environment

# Database
npm run db:migrate       # Run migrations
npm run db:seed         # Seed database
npm run db:reset        # Reset and reseed database

# Testing
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Maintenance
npm run logs:clear      # Clear log files
npm run uploads:clear   # Clear uploaded files
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 5000 |
| `DB_HOST` | Database host | localhost |
| `DB_NAME` | Database name | social_scheduler |
| `REDIS_HOST` | Redis host | localhost |
| `JWT_SECRET` | JWT secret key | - |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | - |
| `OPENAI_API_KEY` | OpenAI API key | - |

## Project Structure

  ```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── jobs/           # Background jobs
│   ├── utils/          # Utility functions
│   └── database/       # Migrations & seeds
├── uploads/            # File uploads
├── logs/              # Application logs
└── scripts/           # Setup scripts
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License - see LICENSE file for details.