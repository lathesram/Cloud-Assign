# Code Review Service

## Setup
1. `npm install`
2. Configure `.env` file with AWS credentials
3. `npm run dev`

## API Endpoints
- `POST /api/v1/reviews/upload` - Upload file for review
- `GET /api/v1/reviews/:id` - Get review
- `PUT /api/v1/reviews/:id` - Add annotations
- `GET /api/v1/reviews/mentee/:id` - Get mentee reviews
- `GET /api/v1/reviews/mentor/:id` - Get mentor reviews