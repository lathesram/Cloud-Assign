# Get Your Service URLs

## Step 1: Find Public IPs
1. Go to **AWS Console** → **ECS** → **Clusters** → **skillbridge-cluster**
2. Click **Services** tab
3. For each service, click on it → **Tasks** tab → Click the running task
4. Under **Network** section, copy the **Public IP**

## Step 2: Test Your Services

### Frontend App
- URL: `http://[frontend-public-ip]`
- Port: 80
- Test: Should show your Angular application

### User Service  
- URL: `http://[user-service-public-ip]:3000`
- Test endpoints:
  - `GET /health` - Health check
  - `GET /api/users` - List users
  - `POST /api/users` - Create user

### Booking Service
- URL: `http://[booking-service-public-ip]:3000`  
- Test endpoints:
  - `GET /health` - Health check
  - `GET /api/bookings` - List bookings
  - `POST /api/bookings` - Create booking

### Code Review Service
- URL: `http://[code-review-service-public-ip]:3000`
- Test endpoints:
  - `GET /health` - Health check
  - `GET /api/reviews` - List reviews
  - `POST /api/reviews` - Create review

## Step 3: Update Frontend Configuration
Your Angular app needs to know the backend service URLs. Update these files:
- `app/src/environments/environment.prod.ts`
- `app/src/environments/environment.docker.ts`

Add the actual service URLs to connect frontend to backend services.