# SkillBridge Kubernetes Setup

Simple instructions to run SkillBridge on Kubernetes using minikube.

## Step 1: Install Tools (Mac)

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install --cask docker
brew install kubectl minikube
```

## Step 2: Start Kubernetes

```bash
# Start minikube cluster
minikube start

# Enable ingress
minikube addons enable ingress

# Check it's working
kubectl cluster-info
```

## Step 3: Build Docker Images

```bash
# Build all service images (run from services directory)
cd ../auth-service && docker build -t auth-service:latest .
cd ../booking-service && docker build -t booking-service:latest .
cd ../code-review-service && docker build -t code-review-service:latest .
cd ../messaging-service && docker build -t messaging-service:latest .
cd ../user-service && docker build -t user-service:latest .
```

## Step 4: Deploy to Kubernetes

```bash
# Go to k8s folder
cd k8s

# Deploy everything in order
kubectl apply -f 00-namespace-config.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-auth-service.yaml
kubectl apply -f 03-booking-service.yaml
kubectl apply -f 04-code-review-service.yaml
kubectl apply -f 05-messaging-service.yaml
kubectl apply -f 06-user-service.yaml
kubectl apply -f 07-ingress.yaml

# Wait for pods to start
kubectl get pods -n skillbridge
```

## Step 5: Access Your Services

```bash
# Get minikube IP and add to hosts
minikube ip
echo "$(minikube ip) skillbridge.local" | sudo tee -a /etc/hosts

# Access via browser:
# http://skillbridge.local/auth
# http://skillbridge.local/users  
# http://skillbridge.local/bookings
```

## Troubleshooting

```bash
# Check pod status
kubectl get pods -n skillbridge

# View logs
kubectl logs deployment/auth-service -n skillbridge
```

That's it! Your SkillBridge platform is now running on Kubernetes. ✅