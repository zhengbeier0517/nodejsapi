# MOOC Admin System - Node.js Backend API

Express.js REST API for the MOOC online learning platform.

## Tech Stack

| Category       | Technology         |
| -------------- | ------------------ |
| Runtime        | Node.js            |
| Framework      | Express.js         |
| ORM            | Sequelize          |
| Database       | MySQL              |
| Authentication | JWT (express-jwt)  |
| Validation     | express-validator  |
| Documentation  | Swagger/OpenAPI    |
| Caching        | Redis / Node-Cache |
| Logging        | Winston            |

## Project Structure

```
nodejsapi/
├── router/          # Route definitions
├── controller/      # Request handlers
├── service/         # Business logic
├── models/          # Sequelize ORM models
├── middleware/      # Express middleware
├── common/          # Utilities, errors, cache, logging
├── migrations/      # Database migrations
├── seeders/         # Database seeders
├── config/          # Sequelize CLI config
├── db/              # Database connections
├── logs/            # Application logs (gitignored)
└── public/upload/   # File uploads
```

## Getting Started

### Prerequisites

- Node.js v16+
- MySQL server
- npm or yarn

### Database Setup

```sql
CREATE DATABASE moocdb27;
```

### Installation

```bash
# Install dependencies
npm install

# Run migrations and seeders
npm run init-db

# Start development server
npm run dev
```

Server runs at: `http://localhost:9100`

### Available Scripts

```bash
npm run dev        # Start with nodemon (auto-reload)
npm run init-db    # Run migrations and seeders
npm run reset-db   # Reset database completely
```

## Environment Configuration

The project uses a two-file configuration approach:

| File                     | Purpose              | Git Status     |
| ------------------------ | -------------------- | -------------- |
| `.env.development`       | Shared team defaults | Committed      |
| `.env.development.local` | Your local overrides | **Gitignored** |

`.local` files take priority and override values from the base config.

### Step 1: Review `.env.development` (shared)

This file contains team defaults and is already committed

### Step 2: Create `.env.development.local` (your overrides)

Create this file to override with your local settings.

This file is gitignored - each developer can have their own database setup without conflicts.

## Architecture

### Request Flow

```
Request → Router → Middleware (Validation) → Controller → Service → Model → Database
                                                            ↓
                                                     Cache (Redis/Node-Cache)
```

### Response Format

All API responses follow this structure:

```json
{
  "isSuccess": true,
  "status": 200,
  "data": {},
  "time": "2025-01-10T12:00:00.000Z",
  "message": "success"
}
```

### Service Layer Pattern

```javascript
// Services return standardized response
return {
  isSuccess: boolean,
  message: string,
  data: any,
};
```

## API Documentation

Swagger UI: `http://localhost:9100/api-docs`

## License

Educational project - P3 Level 1 MOOC coursework.
