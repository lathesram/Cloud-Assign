# Set Up Application Load Balancer

## Why Use Load Balancer?
- Single domain for all services
- SSL/HTTPS support
- Better security (services behind private network)
- Automatic health checks
- No CORS issues

## Steps:
1. **Create Application Load Balancer**
   - AWS Console → EC2 → Load Balancers → Create Load Balancer
   - Choose "Application Load Balancer"
   - Internet-facing, IPv4

2. **Configure Target Groups**
   - Create target group for each service
   - Target type: IP addresses
   - Health check paths: `/health`

3. **Update ECS Services**
   - Attach target groups to ECS services
   - Remove public IPs (services run in private subnets)

4. **Configure Routing Rules**
   - `/api/users/*` → User Service
   - `/api/bookings/*` → Booking Service  
   - `/api/reviews/*` → Code Review Service
   - `/*` → Frontend App

## Result:
- Single URL: `http://your-load-balancer-dns.amazonaws.com`
- All services accessible through one domain
- Production-ready architecture