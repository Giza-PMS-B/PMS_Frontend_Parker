# Technical Documentation - DevOps

This document provides comprehensive DevOps technical information for the PMS Parker Frontend application, including deployment architecture, CI/CD pipeline, infrastructure setup, and operational procedures.

## Table of Contents
- [Overview](#overview)
- [Infrastructure Architecture](#infrastructure-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Docker Configuration](#docker-configuration)
- [Build Process](#build-process)
- [CI/CD Pipeline](#cicd-pipeline)
- [Network Configuration](#network-configuration)
- [Infrastructure Setup](#infrastructure-setup)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Configuration Management](#configuration-management)
- [Security](#security)
- [Scaling and High Availability](#scaling-and-high-availability)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Overview

PMS Parker Frontend is deployed as a containerized application using Docker Swarm for orchestration. The application is built using a multi-stage Docker build process and deployed through a Jenkins CI/CD pipeline.

### Key Infrastructure Components
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Swarm
- **Web Server**: Nginx (Alpine)
- **CI/CD**: Jenkins Pipeline
- **Network**: Docker Overlay Network (`pms-network`)
- **Registry**: Docker Hub (`wagihh/pms-parker-frontend`)

## Infrastructure Architecture

### Deployment Topology

```
┌─────────────────────────────────────────────────────────┐
│                  Docker Swarm Cluster                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         pms-network (Overlay Network)           │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │     pms-parker Stack                     │  │  │
│  │  │                                           │  │  │
│  │  │  ┌──────────────┐    ┌──────────────┐   │  │  │
│  │  │  │   Replica 1  │    │   Replica 2  │   │  │  │
│  │  │  │  :8086:80    │    │  :8086:80    │   │  │  │
│  │  │  │  (Container) │    │  (Container) │   │  │  │
│  │  │  └──────────────┘    └──────────────┘   │  │  │
│  │  │                                           │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Infrastructure Components

- **Docker Swarm Manager**: Orchestrates container deployment
- **Docker Swarm Workers**: Host running containers
- **Overlay Network**: Enables multi-host communication
- **Load Balancer**: Swarm's built-in load balancing (port 8086)
- **Service Discovery**: Docker Swarm DNS

## Deployment Architecture

### Docker Swarm Stack Configuration

The application is deployed as a Docker Swarm stack with the following specifications:

- **Stack Name**: `pms-parker`
- **Service Name**: `pms-parker_parker-frontend`
- **Image**: `wagihh/pms-parker-frontend:${BUILD_NUMBER}`
- **Replicas**: 2 (configurable via `docker-compose.yml`)
- **Restart Policy**: `on-failure`
- **Update Strategy**: Rolling update (default)
- **Port Mapping**: `8086:80` (host:container)

### Service Configuration

```yaml
Service: parker-frontend
├── Image: ${IMAGE_TAG}
├── Replicas: 2
├── Restart Policy: on-failure
├── Network: pms-network (external)
├── Ports: 8086:80
└── Deploy Mode: Replicated
```

### Resource Requirements

- **CPU**: Shared (no limits set)
- **Memory**: Shared (no limits set)
- **Storage**: Minimal (Alpine-based images)
- **Network**: Overlay network for inter-service communication

## Docker Configuration

### Dockerfile Structure

The Dockerfile uses a multi-stage build to optimize image size:

#### Stage 1: Build Stage
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```
- **Base Image**: `node:20-alpine`
- **Purpose**: Build Angular application
- **Output**: `/app/dist/parker/browser`

#### Stage 2: Runtime Stage
```dockerfile
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/parker/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
- **Base Image**: `nginx:alpine`
- **Purpose**: Serve static files
- **Port**: 80
- **Image Size**: ~50MB (Alpine-based)

### Docker Compose Configuration

Key configuration in `docker-compose.yml`:

```yaml
version: "3.9"

services:
  parker-frontend:
    image: ${IMAGE_TAG}
    ports:
      - "8086:80"
    networks:
      - pms-network
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure

networks:
  pms-network:
    external: true
```

### Image Management

- **Registry**: Docker Hub
- **Image Naming**: `wagihh/pms-parker-frontend`
- **Tagging Strategy**:
  - `${BUILD_NUMBER}`: Specific build version
  - `latest`: Latest stable build
- **Image Retention**: Managed by registry policies

## Build Process

### Build Pipeline Stages

1. **Dependency Installation**
   - Uses `npm ci` for reproducible builds
   - Installs production and development dependencies
   - Cached layer for faster subsequent builds

2. **Application Build**
   - Angular production build
   - Optimized and minified output
   - Asset hashing for cache busting

3. **Image Creation**
   - Multi-stage build reduces final image size
   - Only runtime dependencies included
   - Alpine-based for minimal footprint

### Build Optimization

- **Layer Caching**: Dependencies cached separately from source code
- **Multi-stage Build**: Reduces final image size by ~90%
- **Alpine Images**: Minimal base images reduce attack surface
- **Build Context**: `.dockerignore` excludes unnecessary files

### Build Commands

```bash
# Build image locally
docker build -t pms-parker-frontend:latest .

# Build with specific tag
docker build -t wagihh/pms-parker-frontend:v1.0.0 .

# Build and push
docker build -t wagihh/pms-parker-frontend:latest .
docker push wagihh/pms-parker-frontend:latest
```

## CI/CD Pipeline

### Jenkins Pipeline Overview

The Jenkins pipeline automates the complete deployment lifecycle:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Checkout │ -> │  Build   │ -> │  Deploy  │ -> │  Verify  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Pipeline Stages

#### 1. Checkout Stage
- **Action**: Clone repository from GitHub
- **Branch**: `main`
- **Credentials**: GitHub PAT (`github-pat-wagih`)

#### 2. Verify Docker Swarm Stage
- **Action**: Verify Swarm is active
- **Command**: `docker info --format '{{.Swarm.LocalNodeState}}'`
- **Failure**: Pipeline stops if Swarm is not active

#### 3. Docker Login Stage
- **Action**: Authenticate with Docker registry
- **Credentials**: Docker Hub credentials (`Docker-PAT`)
- **Method**: Username/password authentication

#### 4. Save Previous Image Stage
- **Action**: Capture current running image version
- **Purpose**: Enable rollback on failure
- **Command**: `docker service inspect` to get current image

#### 5. Build Docker Image Stage
- **Action**: Build and tag Docker image
- **Tags**: 
  - `${IMAGE_NAME}:${BUILD_NUMBER}`
  - `${IMAGE_NAME}:latest`
- **Build Context**: Current directory

#### 6. Deploy to Docker Swarm Stage
- **Action**: Deploy stack with new image
- **Command**: `docker stack deploy -c docker-compose.yml ${STACK_NAME}`
- **Environment**: `IMAGE_TAG=${BUILD_IMAGE}`

#### 7. Health Check Stage
- **Action**: Verify service is running
- **Wait Time**: 30 seconds (for service to stabilize)
- **Check**: Count running tasks
- **Failure**: Pipeline fails if no tasks running

### Rollback Mechanism

On pipeline failure:
1. Pipeline enters `post { failure }` block
2. Checks if `PREVIOUS_IMAGE` exists
3. Redeploys stack with previous image
4. Ensures service continuity

### Pipeline Environment Variables

```groovy
IMAGE_NAME     = "wagihh/pms-parker-frontend"
STACK_NAME     = "pms-parker"
SERVICE_NAME   = "parker-frontend"
BUILD_IMAGE    = "${IMAGE_NAME}:${BUILD_NUMBER}"
LATEST_IMAGE   = "${IMAGE_NAME}:latest"
PREVIOUS_IMAGE = ""  // Captured during pipeline
```

### Pipeline Triggers

- **Manual**: Triggered manually from Jenkins
- **Git Push**: Can be configured for automatic triggers
- **Scheduled**: Can be configured for scheduled builds

## Network Configuration

### Docker Network Setup

#### Network Requirements

- **Network Name**: `pms-network`
- **Type**: External (must exist before deployment)
- **Driver**: Overlay (for multi-host Swarm)
- **Scope**: Swarm (global)

#### Network Creation

The network must be created before deployment:

```bash
# Create overlay network
docker network create \
  --driver overlay \
  --attachable \
  pms-network
```

#### Network Verification

```bash
# List networks
docker network ls | grep pms-network

# Inspect network
docker network inspect pms-network

# Verify network connectivity
docker network inspect pms-network --format '{{.Containers}}'
```

### Network Architecture

- **Service Discovery**: Automatic DNS resolution
- **Load Balancing**: Swarm's built-in load balancer
- **Port Publishing**: Port 8086 exposed on all Swarm nodes
- **Inter-service Communication**: Via service names

## Infrastructure Setup

### Prerequisites

1. **Docker Swarm**
   ```bash
   # Initialize Swarm (on manager node)
   docker swarm init
   
   # Join Swarm (on worker nodes)
   docker swarm join --token <token> <manager-ip>:2377
   ```

2. **Docker Network**
   ```bash
   # Create overlay network
   docker network create --driver overlay pms-network
   ```

3. **Docker Registry Access**
   - Docker Hub account credentials
   - Access to `wagihh/pms-parker-frontend` repository

4. **Jenkins Setup**
   - Jenkins server with Docker plugin
   - Docker Swarm access from Jenkins
   - GitHub and Docker Hub credentials configured

### Initial Deployment

1. **Verify Swarm Status**
   ```bash
   docker info --format '{{.Swarm.LocalNodeState}}'
   ```

2. **Verify Network Exists**
   ```bash
   docker network ls | grep pms-network
   ```

3. **Deploy Stack**
   ```bash
   export IMAGE_TAG=wagihh/pms-parker-frontend:latest
   docker stack deploy -c docker-compose.yml pms-parker
   ```

4. **Verify Deployment**
   ```bash
   docker service ls
   docker service ps pms-parker_parker-frontend
   ```

## Monitoring and Health Checks

### Service Health Monitoring

#### Check Service Status
```bash
# List all services
docker service ls

# Check specific service
docker service ps pms-parker_parker-frontend

# View service details
docker service inspect pms-parker_parker-frontend
```

#### Health Check Script
```bash
#!/bin/bash
RUNNING=$(docker service ps pms-parker_parker-frontend \
  --filter "desired-state=running" \
  --format "{{.CurrentState}}" | grep Running | wc -l)

if [ "$RUNNING" -lt 1 ]; then
  echo "Service is not running"
  exit 1
else
  echo "Service is running with $RUNNING replicas"
fi
```

### Logging

#### View Service Logs
```bash
# View logs
docker service logs pms-parker_parker-frontend

# Follow logs
docker service logs -f pms-parker_parker-frontend

# View logs with timestamps
docker service logs --timestamps pms-parker_parker-frontend

# View last 100 lines
docker service logs --tail 100 pms-parker_parker-frontend
```

### Metrics

#### Service Metrics
```bash
# View service statistics
docker stats $(docker ps -q --filter "name=pms-parker")

# Service resource usage
docker service inspect pms-parker_parker-frontend --format '{{.Spec.TaskTemplate.Resources}}'
```

### Application Health Endpoints

- **HTTP Health Check**: `curl http://localhost:8086`
- **Expected Response**: HTTP 200 with HTML content
- **Response Time**: < 1 second (typical)

## Configuration Management

### Environment Variables

#### Docker Compose Variables
- `IMAGE_TAG`: Docker image tag to deploy
  ```bash
  export IMAGE_TAG=wagihh/pms-parker-frontend:latest
  ```

#### Service Configuration
- Managed via `docker-compose.yml`
- No runtime environment variables required
- Configuration baked into Docker image

### Nginx Configuration

The application uses a custom Nginx configuration:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Key Features**:
- SPA routing support
- Static file serving
- Default index.html fallback

### Stack Configuration Updates

To update configuration:

1. Modify `docker-compose.yml`
2. Redeploy stack:
   ```bash
   docker stack deploy -c docker-compose.yml pms-parker
   ```
3. Swarm performs rolling update automatically

## Security

### Container Security

- **Base Images**: Alpine Linux (minimal attack surface)
- **Non-root User**: Nginx runs as non-root user
- **Image Scanning**: Recommended to scan images for vulnerabilities
- **Secrets Management**: Use Docker secrets for sensitive data (if needed)

### Network Security

- **Network Isolation**: Services isolated in overlay network
- **Port Exposure**: Only port 8086 exposed externally
- **Internal Communication**: Services communicate via overlay network

### Registry Security

- **Authentication**: Docker Hub credentials required
- **Image Signing**: Consider implementing image signing
- **Access Control**: Limit registry access to authorized users

### Best Practices

1. **Regular Updates**: Keep base images updated
2. **Vulnerability Scanning**: Scan images before deployment
3. **Least Privilege**: Run containers with minimal privileges
4. **Network Policies**: Use network policies to restrict communication
5. **HTTPS**: Configure HTTPS at load balancer level

## Scaling and High Availability

### Horizontal Scaling

#### Scale Service
```bash
# Scale to 3 replicas
docker service scale pms-parker_parker-frontend=3

# Or update docker-compose.yml and redeploy
```

#### Update Replicas in docker-compose.yml
```yaml
deploy:
  replicas: 3  # Change from 2 to 3
```

### High Availability Features

- **Multiple Replicas**: 2+ replicas for redundancy
- **Automatic Restart**: Restart policy on failure
- **Load Balancing**: Swarm's built-in load balancer
- **Rolling Updates**: Zero-downtime deployments

### Update Strategy

Docker Swarm performs rolling updates:
1. Starts new tasks with updated image
2. Waits for new tasks to be healthy
3. Stops old tasks
4. Maintains service availability throughout

### Rollback Procedure

```bash
# Rollback to previous version
export PREVIOUS_IMAGE=wagihh/pms-parker-frontend:<previous-version>
export IMAGE_TAG=${PREVIOUS_IMAGE}
docker stack deploy -c docker-compose.yml pms-parker
```

## Backup and Recovery

### Image Backup

- **Registry**: Images stored in Docker Hub registry
- **Versioning**: Each build tagged with build number
- **Retention**: Latest and previous versions maintained

### Configuration Backup

- **docker-compose.yml**: Version controlled in Git
- **Jenkinsfile**: Version controlled in Git
- **Nginx Config**: Version controlled in Git

### Recovery Procedures

#### Service Recovery
```bash
# Remove and redeploy service
docker service rm pms-parker_parker-frontend
export IMAGE_TAG=wagihh/pms-parker-frontend:latest
docker stack deploy -c docker-compose.yml pms-parker
```

#### Stack Recovery
```bash
# Remove entire stack
docker stack rm pms-parker

# Redeploy stack
export IMAGE_TAG=wagihh/pms-parker-frontend:latest
docker stack deploy -c docker-compose.yml pms-parker
```

## Troubleshooting

### Common Issues

#### Service Not Starting

**Symptoms**: Service shows 0/2 replicas running

**Diagnosis**:
```bash
# Check service status
docker service ps pms-parker_parker-frontend --no-trunc

# Check logs
docker service logs pms-parker_parker-frontend

# Verify network
docker network inspect pms-network
```

**Solutions**:
- Verify Docker Swarm is active
- Check network exists and is accessible
- Verify image exists and is pullable
- Check port 8086 is not in use

#### Network Connectivity Issues

**Symptoms**: Containers cannot communicate

**Diagnosis**:
```bash
# Verify network exists
docker network ls | grep pms-network

# Inspect network
docker network inspect pms-network

# Check service network attachment
docker service inspect pms-parker_parker-frontend --format '{{.Spec.TaskTemplate.Networks}}'
```

**Solutions**:
- Ensure network is overlay type
- Verify network is attached to service
- Check network driver is correct

#### Image Pull Failures

**Symptoms**: Service cannot pull image

**Diagnosis**:
```bash
# Try manual pull
docker pull wagihh/pms-parker-frontend:latest

# Check registry authentication
docker login
```

**Solutions**:
- Verify Docker Hub credentials
- Check image exists in registry
- Verify network connectivity to registry

#### Port Conflicts

**Symptoms**: Cannot bind to port 8086

**Diagnosis**:
```bash
# Check port usage
netstat -tuln | grep 8086
# or
lsof -i :8086
```

**Solutions**:
- Stop conflicting service
- Change port in docker-compose.yml
- Free up port 8086

### Debugging Commands

#### View Service Details
```bash
docker service inspect pms-parker_parker-frontend --pretty
```

#### Check Service Tasks
```bash
docker service ps pms-parker_parker-frontend --no-trunc
```

#### Access Container Shell
```bash
# Get container ID
CONTAINER_ID=$(docker ps -q --filter "name=pms-parker")

# Access shell
docker exec -it $CONTAINER_ID sh
```

#### View Nginx Logs
```bash
docker service logs pms-parker_parker-frontend
```

#### Check Swarm Status
```bash
docker info --format '{{.Swarm.LocalNodeState}}'
docker node ls
```

### Performance Issues

#### High Resource Usage
```bash
# Monitor resource usage
docker stats

# Check service resource limits
docker service inspect pms-parker_parker-frontend --format '{{.Spec.TaskTemplate.Resources}}'
```

#### Slow Response Times
- Check service logs for errors
- Verify network latency
- Check container resource limits
- Monitor Swarm node resources

## Additional Resources

- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Version History

- **v0.0.0**: Initial DevOps setup
  - Docker Swarm deployment
  - Jenkins CI/CD pipeline
  - Multi-stage Docker build
  - Overlay network configuration
  - Health check integration
  - Rollback mechanism
