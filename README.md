# Media Microservice

A dedicated microservice for managing media files (user avatars) in the CoffeeDoor microservices ecosystem. Built with NestJS and gRPC for efficient inter-service communication.

## Features

- **Avatar Upload** - Upload user avatars with automatic image processing
- **Image Processing** - Automatic conversion to WebP format and resizing to 200x200 pixels
- **Signed URLs** - Generate secure, time-limited URLs for accessing images
- **Avatar Deletion** - Remove avatar files from storage
- **Health Checks** - Built-in health check endpoint for orchestration

## Technology Stack

- **Framework:** NestJS v11
- **Runtime:** Node.js 24 (Alpine)
- **Communication:** gRPC
- **Storage:** AWS S3
- **Image Processing:** Sharp
- **Language:** TypeScript

## gRPC Endpoints

### MediaService

| Method | Request | Response | Description |
|--------|---------|----------|-------------|
| `GetImageUrl` | `FileKey { file_key }` | `FileUrl { file_url }` | Generate a signed URL (1 hour expiry) |
| `UploadAvatar` | `{ id, file }` | `FileUrl { file_url }` | Upload and process avatar |
| `DeleteAvatar` | `FileKey { file_key }` | `{ success, message }` | Delete avatar from S3 |

### HealthCheckService

| Method | Request | Response | Description |
|--------|---------|----------|-------------|
| `CheckAppHealth` | `Empty` | `{ serving, message }` | Service health status |

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Deployment Environment
NODE_ENV=development

# gRPC Connection
TRANSPORT_URL=0.0.0.0:5003
HTTP_PORT=9103

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_REGION=eu-north-1
S3_BUCKET_NAME=<your-bucket-name>
```

## Project Setup

```bash
# Install dependencies
npm install

# Generate gRPC types from proto files
npm run proto:generate
```

## Running the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

The service will be available at:
- **gRPC:** `0.0.0.0:5003`
- **HTTP:** `0.0.0.0:9103`

## Project Structure

```
src/
├── app.module.ts           # Root module
├── main.ts                 # Application entry point
├── health-check/           # Health check module
│   ├── health-check.controller.ts
│   └── health-check.module.ts
├── media/                  # Core media functionality
│   ├── media.controller.ts
│   ├── media.service.ts
│   ├── media.module.ts
│   └── tests/              # Unit tests
│       ├── media.controller.spec.ts
│       └── media.service.spec.ts
├── utils/                  # Utilities
│   ├── env.dto.ts
│   ├── errors/
│   ├── filters/
│   └── validators/
└── generated-types/        # gRPC proto-generated types
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Proto Files

The service uses protocol buffers for gRPC communication:
- `proto/media.proto` - MediaService interface
- `proto/health-check.proto` - HealthCheckService interface

## Network

This service connects to the `coffeedoor-network` Docker network for inter-service communication with other microservices in the ecosystem.

## License

This project is proprietary software.
