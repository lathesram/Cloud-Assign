#!/bin/bash

# Service URL Testing Script
echo "🔍 Testing SkillBridge Services..."

# Replace these with your actual service IPs
FRONTEND_IP="YOUR_FRONTEND_IP"
USER_SERVICE_IP="YOUR_USER_SERVICE_IP" 
BOOKING_SERVICE_IP="YOUR_BOOKING_SERVICE_IP"
CODE_REVIEW_SERVICE_IP="YOUR_CODE_REVIEW_SERVICE_IP"

echo ""
echo "📱 Testing Frontend App..."
curl -s -o /dev/null -w "Status: %{http_code}" http://$FRONTEND_IP/
echo ""

echo ""
echo "👤 Testing User Service..."
curl -s -o /dev/null -w "Status: %{http_code}" http://$USER_SERVICE_IP:3000/health
echo " - Health Check"
curl -s -o /dev/null -w "Status: %{http_code}" http://$USER_SERVICE_IP:3000/api/users
echo " - Users API"

echo ""
echo "📅 Testing Booking Service..."
curl -s -o /dev/null -w "Status: %{http_code}" http://$BOOKING_SERVICE_IP:3000/health
echo " - Health Check"
curl -s -o /dev/null -w "Status: %{http_code}" http://$BOOKING_SERVICE_IP:3000/api/bookings
echo " - Bookings API"

echo ""
echo "📝 Testing Code Review Service..."
curl -s -o /dev/null -w "Status: %{http_code}" http://$CODE_REVIEW_SERVICE_IP:3000/health
echo " - Health Check"
curl -s -o /dev/null -w "Status: %{http_code}" http://$CODE_REVIEW_SERVICE_IP:3000/api/reviews
echo " - Reviews API"

echo ""
echo "✅ Testing complete!"
echo ""
echo "Status codes:"
echo "200 = Working perfectly"
echo "404 = Service running but endpoint not found" 
echo "000 = Service not reachable"