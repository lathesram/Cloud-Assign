#!/bin/bash

# Simple SkillBridge Kubernetes Deployment Script for Assignment
# This script deploys the SkillBridge microservices to a Kubernetes cluster

echo "🚀 Deploying SkillBridge to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Build Docker images (if --build flag is passed)
if [[ "$1" == "--build" ]]; then
    echo "🔨 Building Docker images..."
    
    services=("auth-service" "booking-service" "code-review-service" "messaging-service" "user-service")
    
    for service in "${services[@]}"; do
        echo "Building $service..."
        docker build -t "skillbridge/$service:latest" "../$service"
    done
    
    echo "✅ All images built successfully"
fi

# Deploy to Kubernetes
echo "📦 Deploying to Kubernetes..."

kubectl apply -f 00-namespace-config.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-auth-service.yaml
kubectl apply -f 03-booking-service.yaml
kubectl apply -f 04-code-review-service.yaml
kubectl apply -f 05-messaging-service.yaml
kubectl apply -f 06-user-service.yaml
kubectl apply -f 07-ingress.yaml

echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod --all -n skillbridge --timeout=300s

echo "📊 Deployment Status:"
kubectl get all -n skillbridge

echo ""
echo "✅ SkillBridge deployment completed!"
echo "🌐 Access your services:"
echo "   - Auth: http://skillbridge.local/auth"
echo "   - Users: http://skillbridge.local/users"
echo "   - Bookings: http://skillbridge.local/bookings"
echo "   - Reviews: http://skillbridge.local/reviews"
echo "   - Messages: http://skillbridge.local/messages"
echo ""
echo "📝 Useful commands:"
echo "   kubectl get pods -n skillbridge"
echo "   kubectl logs -f deployment/auth-service -n skillbridge"
echo "   kubectl port-forward svc/auth-service 3001:3001 -n skillbridge"