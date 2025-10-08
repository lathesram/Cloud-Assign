# Kubernetes Commands Cheat Sheet for SkillBridge

## 🚀 Deployment Commands

### Deploy All Services
```bash
# Using the deployment script
./deploy.sh --build              # Build images and deploy
./deploy.sh                      # Deploy with existing images

# Using PowerShell (Windows)
.\deploy.ps1 -Build              # Build images and deploy
.\deploy.ps1                     # Deploy with existing images
```

### Manual Deployment Steps
```bash
# 1. Create namespace and basic configs
kubectl apply -f k8s/00-namespace-config.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/08-storage.yaml

# 2. Deploy auth-service first (critical dependency)
kubectl apply -f k8s/02-auth-service.yaml

# 3. Wait for auth-service to be ready
kubectl wait --for=condition=available --timeout=300s deployment/auth-service -n skillbridge

# 4. Deploy remaining services
kubectl apply -f k8s/03-booking-service.yaml
kubectl apply -f k8s/04-code-review-service.yaml
kubectl apply -f k8s/05-messaging-service.yaml
kubectl apply -f k8s/06-user-service.yaml

# 5. Apply networking and monitoring
kubectl apply -f k8s/07-ingress.yaml
kubectl apply -f k8s/09-monitoring.yaml
```

## 📊 Status and Monitoring

### Check Overall Status
```bash
# All resources in skillbridge namespace
kubectl get all -n skillbridge

# Pods with more details
kubectl get pods -n skillbridge -o wide

# Services
kubectl get svc -n skillbridge

# Ingress
kubectl get ingress -n skillbridge

# ConfigMaps and Secrets
kubectl get cm,secrets -n skillbridge

# Persistent Volumes
kubectl get pv,pvc -n skillbridge
```

### Check Deployment Health
```bash
# Deployment status
kubectl get deployments -n skillbridge

# ReplicaSets
kubectl get rs -n skillbridge

# Pod readiness and liveness
kubectl describe pods -n skillbridge | grep -A 10 -B 5 "Conditions"

# Events (very useful for troubleshooting)
kubectl get events -n skillbridge --sort-by='.metadata.creationTimestamp'
```

### Auto-scaling Status
```bash
# HPA status
kubectl get hpa -n skillbridge

# Detailed HPA information
kubectl describe hpa -n skillbridge

# Top pods (requires metrics-server)
kubectl top pods -n skillbridge

# Top nodes
kubectl top nodes
```

## 🔍 Debugging and Logs

### View Logs
```bash
# Current logs for a deployment
kubectl logs deployment/auth-service -n skillbridge

# Follow logs (tail -f equivalent)
kubectl logs -f deployment/auth-service -n skillbridge

# Last 100 lines
kubectl logs --tail=100 deployment/auth-service -n skillbridge

# Logs from all pods of a service
kubectl logs -f -l app=auth-service -n skillbridge

# Logs from previous container (if crashed)
kubectl logs --previous deployment/auth-service -n skillbridge

# Logs with timestamps
kubectl logs --timestamps deployment/auth-service -n skillbridge
```

### Describe Resources (Detailed Info)
```bash
# Describe a deployment
kubectl describe deployment auth-service -n skillbridge

# Describe a pod
kubectl describe pod <pod-name> -n skillbridge

# Describe a service
kubectl describe svc auth-service -n skillbridge

# Describe ingress
kubectl describe ingress skillbridge-ingress -n skillbridge

# Describe HPA
kubectl describe hpa auth-service-hpa -n skillbridge
```

### Execute Commands in Pods
```bash
# Get shell access to a pod
kubectl exec -it deployment/auth-service -n skillbridge -- /bin/sh

# Run a specific command
kubectl exec deployment/auth-service -n skillbridge -- ps aux

# Test connectivity from inside a pod
kubectl exec deployment/auth-service -n skillbridge -- wget -qO- http://booking-service:3002/health
```

## 🔧 Service Management

### Scale Services
```bash
# Scale a specific deployment
kubectl scale deployment auth-service --replicas=3 -n skillbridge

# Scale multiple deployments
kubectl scale deployment auth-service booking-service --replicas=3 -n skillbridge

# Auto-scale (HPA already configured, but you can modify)
kubectl autoscale deployment auth-service --cpu-percent=70 --min=2 --max=10 -n skillbridge
```

### Update Services
```bash
# Update image for a deployment
kubectl set image deployment/auth-service auth-service=skillbridge/auth-service:v2.0 -n skillbridge

# Check rollout status
kubectl rollout status deployment/auth-service -n skillbridge

# View rollout history
kubectl rollout history deployment/auth-service -n skillbridge

# Pause a rollout
kubectl rollout pause deployment/auth-service -n skillbridge

# Resume a rollout
kubectl rollout resume deployment/auth-service -n skillbridge
```

### Rollback Services
```bash
# Rollback to previous version
kubectl rollout undo deployment/auth-service -n skillbridge

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=2 -n skillbridge

# Check rollout status
kubectl rollout status deployment/auth-service -n skillbridge
```

## 🌐 Port Forwarding and Access

### Port Forward Services
```bash
# Forward auth-service to local port 3001
kubectl port-forward svc/auth-service 3001:3001 -n skillbridge

# Forward to a different local port
kubectl port-forward svc/auth-service 8001:3001 -n skillbridge

# Forward messaging service (WebSocket)
kubectl port-forward svc/messaging-service 3004:3004 -n skillbridge

# Port forward a specific pod
kubectl port-forward pod/<pod-name> 3001:3001 -n skillbridge
```

### Test Services
```bash
# Test health endpoints (after port forwarding)
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health

# Test from within cluster
kubectl run test-pod --rm -i --tty --image=curlimages/curl -n skillbridge -- sh
# Then inside the pod:
# curl http://auth-service:3001/health
```

## 🔒 Security and Configuration

### View and Edit Secrets
```bash
# List secrets
kubectl get secrets -n skillbridge

# View secret content (base64 encoded)
kubectl get secret skillbridge-secrets -n skillbridge -o yaml

# Edit a secret
kubectl edit secret skillbridge-secrets -n skillbridge

# Create a new secret
kubectl create secret generic new-secret --from-literal=key1=value1 -n skillbridge
```

### View and Edit ConfigMaps
```bash
# List configmaps
kubectl get cm -n skillbridge

# View configmap content
kubectl get cm skillbridge-config -n skillbridge -o yaml

# Edit a configmap
kubectl edit cm skillbridge-config -n skillbridge
```

## 🗑️ Cleanup Commands

### Delete Specific Resources
```bash
# Delete a deployment
kubectl delete deployment auth-service -n skillbridge

# Delete a service
kubectl delete svc auth-service -n skillbridge

# Delete by file
kubectl delete -f k8s/02-auth-service.yaml
```

### Complete Cleanup
```bash
# Delete all resources in namespace (but keep namespace)
kubectl delete all --all -n skillbridge

# Delete the entire namespace (this removes everything)
kubectl delete namespace skillbridge

# Delete specific resource types
kubectl delete deployments,services,ingress -n skillbridge --all
```

## 📈 Performance and Monitoring

### Resource Usage
```bash
# Current resource usage (requires metrics-server)
kubectl top pods -n skillbridge
kubectl top nodes

# Detailed resource usage for a pod
kubectl describe pod <pod-name> -n skillbridge | grep -A 10 "Requests\|Limits"

# HPA metrics
kubectl get hpa -n skillbridge -o yaml
```

### Network Policies
```bash
# List network policies
kubectl get netpol -n skillbridge

# Describe network policy
kubectl describe netpol skillbridge-network-policy -n skillbridge
```

## 🔄 Advanced Operations

### Drain and Cordon Nodes
```bash
# Cordon a node (prevent new pods)
kubectl cordon <node-name>

# Drain a node (move all pods)
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Uncordon a node
kubectl uncordon <node-name>
```

### Labels and Annotations
```bash
# Add label to a pod
kubectl label pods <pod-name> environment=production -n skillbridge

# View labels
kubectl get pods --show-labels -n skillbridge

# Select by labels
kubectl get pods -l app=auth-service -n skillbridge

# Add annotation
kubectl annotate deployment auth-service deployment.kubernetes.io/revision=1 -n skillbridge
```

### Jobs and CronJobs (if needed)
```bash
# Create a one-time job
kubectl create job setup-db --image=skillbridge/auth-service:latest -n skillbridge -- npm run setup:tables

# Create a cronjob
kubectl create cronjob backup-job --image=skillbridge/backup:latest --schedule="0 2 * * *" -n skillbridge

# List jobs
kubectl get jobs -n skillbridge

# View job logs
kubectl logs job/setup-db -n skillbridge
```

## 🆘 Emergency Procedures

### Emergency Scale Down
```bash
# Scale all deployments to 0 (emergency stop)
kubectl scale deployment --all --replicas=0 -n skillbridge

# Scale back up
kubectl scale deployment --all --replicas=2 -n skillbridge
```

### Emergency Pod Restart
```bash
# Restart all pods in a deployment
kubectl rollout restart deployment/auth-service -n skillbridge

# Force delete a stuck pod
kubectl delete pod <pod-name> --force --grace-period=0 -n skillbridge
```

### Recovery Commands
```bash
# Check cluster health
kubectl get componentstatuses
kubectl cluster-info

# Check node conditions
kubectl describe nodes | grep -A 5 "Conditions"

# Backup current state
kubectl get all -n skillbridge -o yaml > skillbridge-backup.yaml
```

---

## 💡 Pro Tips

1. **Use aliases**: Add these to your shell profile:
   ```bash
   alias k='kubectl'
   alias kgs='kubectl get svc'
   alias kgp='kubectl get pods'
   alias kgd='kubectl get deployments'
   alias kdp='kubectl describe pod'
   alias kdd='kubectl describe deployment'
   ```

2. **Watch resources**: Use `-w` flag to watch resources change in real-time:
   ```bash
   kubectl get pods -n skillbridge -w
   ```

3. **Use JSON Path**: For specific data extraction:
   ```bash
   kubectl get pods -n skillbridge -o jsonpath='{.items[*].metadata.name}'
   ```

4. **Bash completion**: Enable kubectl auto-completion:
   ```bash
   source <(kubectl completion bash)
   ```

5. **Context switching**: If working with multiple clusters:
   ```bash
   kubectl config get-contexts
   kubectl config use-context <context-name>
   ```

Remember to always check the namespace (`-n skillbridge`) in your commands!