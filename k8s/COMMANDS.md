# Kubernetes Commands Reference for SkillBridge Assignment

## Quick Setup Commands

### 1. Setup Minikube (Mac)
```bash
# Start minikube cluster
minikube start

# Enable ingress addon
minikube addons enable ingress

# Check cluster status
kubectl cluster-info
```

### 2. Deploy SkillBridge
```bash
# Navigate to k8s directory
cd k8s

# Run deployment script
chmod +x deploy.sh
./deploy.sh --build
```

## Essential kubectl Commands

### Viewing Resources
```bash
# Get all resources in skillbridge namespace
kubectl get all -n skillbridge

# Get pods with more details
kubectl get pods -n skillbridge -o wide

# Get services
kubectl get svc -n skillbridge

# Get deployments
kubectl get deployments -n skillbridge

# Get ingress
kubectl get ingress -n skillbridge
```

### Monitoring and Debugging
```bash
# View pod logs (real-time)
kubectl logs -f deployment/auth-service -n skillbridge

# View logs for all pods of a service
kubectl logs -l app=auth-service -n skillbridge

# Describe a pod (shows events and issues)
kubectl describe pod <pod-name> -n skillbridge

# Get events in namespace
kubectl get events -n skillbridge --sort-by='.metadata.creationTimestamp'

# Check resource usage
kubectl top pods -n skillbridge
kubectl top nodes
```

### Scaling Services
```bash
# Scale auth-service to 3 replicas
kubectl scale deployment auth-service --replicas=3 -n skillbridge

# Scale all services to 2 replicas
kubectl scale deployment auth-service --replicas=2 -n skillbridge
kubectl scale deployment user-service --replicas=2 -n skillbridge
kubectl scale deployment booking-service --replicas=2 -n skillbridge
```

### Port Forwarding (for testing)
```bash
# Forward auth-service to localhost:3001
kubectl port-forward svc/auth-service 3001:3001 -n skillbridge

# Forward user-service to localhost:3005  
kubectl port-forward svc/user-service 3005:3005 -n skillbridge

# Forward multiple services (run in background)
kubectl port-forward svc/auth-service 3001:3001 -n skillbridge &
kubectl port-forward svc/user-service 3005:3005 -n skillbridge &
kubectl port-forward svc/booking-service 3002:3002 -n skillbridge &
```

### Updates and Rollbacks
```bash
# Update a service image
kubectl set image deployment/auth-service auth-service=skillbridge/auth-service:v2 -n skillbridge

# Check rollout status
kubectl rollout status deployment/auth-service -n skillbridge

# View rollout history
kubectl rollout history deployment/auth-service -n skillbridge

# Rollback to previous version
kubectl rollout undo deployment/auth-service -n skillbridge

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=1 -n skillbridge
```

### Debugging Inside Pods
```bash
# Execute shell in a pod
kubectl exec -it deployment/auth-service -n skillbridge -- /bin/sh

# Run a command in a pod
kubectl exec -it deployment/auth-service -n skillbridge -- ls -la

# Copy files from/to pod
kubectl cp <local-file> skillbridge/<pod-name>:<remote-path>
kubectl cp skillbridge/<pod-name>:<remote-path> <local-file>
```

### Service Discovery Testing
```bash
# Test service connectivity from inside a pod
kubectl exec -it deployment/auth-service -n skillbridge -- /bin/sh

# Inside the pod, test connections:
curl http://user-service:3005/health
curl http://booking-service:3002/health
curl http://messaging-service:3004/health
```

## Assignment Demo Commands

### 1. Show Initial Deployment
```bash
kubectl get all -n skillbridge
kubectl get pods -n skillbridge -o wide
```

### 2. Demonstrate Scaling
```bash
# Scale up
kubectl scale deployment auth-service --replicas=3 -n skillbridge
kubectl get pods -n skillbridge -w

# Scale down
kubectl scale deployment auth-service --replicas=1 -n skillbridge
```

### 3. Demonstrate Rolling Updates
```bash
# Update image tag (simulate new version)
kubectl set image deployment/auth-service auth-service=skillbridge/auth-service:v2 -n skillbridge

# Watch the rollout
kubectl rollout status deployment/auth-service -n skillbridge

# Check pods during update
kubectl get pods -n skillbridge -w
```

### 4. Demonstrate Service Discovery
```bash
# Show services can communicate
kubectl exec -it deployment/user-service -n skillbridge -- curl http://auth-service:3001/health
```

### 5. Show Logs and Monitoring
```bash
# Show logs from multiple pods
kubectl logs -f -l app=auth-service -n skillbridge

# Show resource usage
kubectl top pods -n skillbridge
```

## Accessing Services via Ingress

### Setup /etc/hosts
```bash
# Get minikube IP
minikube ip

# Add to hosts file (replace <IP> with actual minikube IP)
echo "<IP> skillbridge.local" | sudo tee -a /etc/hosts
```

### Test External Access
```bash
# Test each service endpoint
curl http://skillbridge.local/auth/health
curl http://skillbridge.local/users/health  
curl http://skillbridge.local/bookings/health
curl http://skillbridge.local/reviews/health
curl http://skillbridge.local/messages/health
```

## Cleanup Commands

### Partial Cleanup
```bash
# Delete specific deployments
kubectl delete deployment auth-service -n skillbridge
kubectl delete service auth-service -n skillbridge

# Delete ingress
kubectl delete ingress skillbridge-ingress -n skillbridge
```

### Complete Cleanup
```bash
# Delete entire namespace (removes everything)
kubectl delete namespace skillbridge

# Or delete all resources using manifest files
kubectl delete -f k8s/
```

### Stop Minikube
```bash
# Stop minikube cluster
minikube stop

# Delete minikube cluster (complete reset)
minikube delete
```

## Troubleshooting Commands

### Pod Issues
```bash
# Check why pod is not starting
kubectl describe pod <pod-name> -n skillbridge

# Check pod logs
kubectl logs <pod-name> -n skillbridge

# Check previous container logs (if pod restarted)
kubectl logs <pod-name> -n skillbridge --previous
```

### Service Issues  
```bash
# Check service endpoints
kubectl get endpoints -n skillbridge

# Describe service
kubectl describe service auth-service -n skillbridge
```

### Network Issues
```bash
# Test DNS resolution inside cluster
kubectl exec -it deployment/auth-service -n skillbridge -- nslookup user-service

# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx
```

## Useful Aliases (Optional)
```bash
# Add to ~/.bashrc or ~/.zshrc
alias k='kubectl'
alias kgp='kubectl get pods'
alias kgs='kubectl get services' 
alias kgd='kubectl get deployments'
alias kn='kubectl config set-context --current --namespace'

# Usage examples:
# k get pods -n skillbridge
# kgp -n skillbridge
# kn skillbridge  # set default namespace
```

---

**Copy these commands for quick reference during your assignment demo! 📋**