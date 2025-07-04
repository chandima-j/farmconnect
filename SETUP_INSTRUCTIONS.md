# FarmConnect - PostgreSQL + Prisma Setup Instructions

## 🏗️ Architecture Overview

**Technology Stack:**
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcrypt
- **Architecture**: Full-Stack Monolithic Application

**Architecture Type**: **Monolithic**
- Single codebase with frontend and backend
- Shared database
- Direct API communication
- Easier development and deployment for small to medium applications

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb farmconnect

# Update .env with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/farmconnect"
```

**Option B: Docker PostgreSQL**
```bash
# Run PostgreSQL in Docker
docker run --name farmconnect-db \
  -e POSTGRES_DB=farmconnect \
  -e POSTGRES_USER=farmconnect \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  -d postgres:15

# Update .env
DATABASE_URL="postgresql://farmconnect:password123@localhost:5432/farmconnect"
```

**Option C: Cloud PostgreSQL (Recommended for Production)**
- **Supabase**: Free tier with 500MB storage
- **Railway**: Free tier with 1GB storage  
- **Neon**: Free tier with 3GB storage
- **PlanetScale**: MySQL alternative with generous free tier

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
DATABASE_URL="postgresql://username:password@localhost:5432/farmconnect"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

### 4. Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR run migrations (for production)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# OR start individually
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:3001
```

## 🔑 Test Accounts

After seeding, you can use these test accounts:

- **Admin**: `admin@farmconnect.com` / `admin123`
- **Farmer**: `farmer@test.com` / `farmer123`  
- **Buyer**: `buyer@test.com` / `buyer123`

## 📊 Database Management

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database (careful!)
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

## 🏭 Production Deployment

### Build for Production

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
PORT=3001
CLIENT_URL="https://your-domain.com"
NODE_ENV="production"
```

### Deployment Options

**1. Railway (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**2. Render**
- Connect GitHub repository
- Set environment variables
- Deploy automatically

**3. Heroku**
```bash
# Install Heroku CLI and deploy
heroku create farmconnect-app
git push heroku main
```

**4. DigitalOcean App Platform**
- Connect GitHub repository
- Configure build and run commands
- Set environment variables

## 🔧 Development Tools

### Database Tools
```bash
# Prisma Studio (Database GUI)
npm run db:studio

# Database introspection
npx prisma db pull

# Schema validation
npx prisma validate
```

### API Testing
```bash
# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/products
```

## 🛡️ Security Features

### Implemented Security
- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Input validation with Zod
- ✅ CORS configuration
- ✅ SQL injection protection (Prisma)
- ✅ Environment variable protection

### Additional Security (Production)
- [ ] Rate limiting
- [ ] Helmet.js for security headers
- [ ] HTTPS enforcement
- [ ] Input sanitization
- [ ] API key authentication for admin routes

## 📈 Monitoring & Logging

### Development
```bash
# View server logs
npm run dev:server

# Database query logging (add to schema.prisma)
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### Production Monitoring
- **Sentry**: Error tracking
- **LogRocket**: User session recording
- **DataDog**: Application monitoring
- **Prisma Pulse**: Database monitoring

## 🔄 Migration from Supabase

### What Changed
1. **Database**: Supabase PostgreSQL → Self-hosted/Cloud PostgreSQL
2. **ORM**: Supabase Client → Prisma ORM
3. **Auth**: Supabase Auth → Custom JWT Auth
4. **API**: Supabase Functions → Express.js Routes
5. **Real-time**: Supabase Realtime → WebSocket (if needed)

### Benefits of New Architecture
- ✅ **No email restrictions** - Use any email for testing
- ✅ **No rate limits** - Full control over API limits
- ✅ **Better TypeScript support** - Prisma generates types
- ✅ **More flexibility** - Custom business logic
- ✅ **Cost effective** - Pay only for what you use
- ✅ **Easier debugging** - Full control over backend

### Migration Steps
1. Export data from Supabase (if any)
2. Set up new PostgreSQL database
3. Run Prisma migrations
4. Import data (if any)
5. Update frontend to use new API
6. Test all functionality

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check database exists
psql -h localhost -p 5432 -l
```

**Prisma Client Error**
```bash
# Regenerate Prisma client
npm run db:generate

# Reset and regenerate
npx prisma generate --force
```

**Port Already in Use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

**JWT Secret Error**
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review Prisma/Express documentation
3. Check database logs
4. Create GitHub issue with details

---

**🎉 You now have a fully functional, production-ready farm marketplace with no external dependencies or restrictions!**