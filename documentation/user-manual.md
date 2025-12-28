# User Scripts Documentation

This document provides instructions for running various scripts and commands for the PMS Parker Frontend application.

## Table of Contents
- [Local Development](#local-development)
- [Docker Commands](#docker-commands)
- [Deployment Scripts](#deployment-scripts)
- [Utility Scripts](#utility-scripts)

## Local Development

### Prerequisites
- Node.js 20 or higher
- npm 10.9.3 or higher
- Angular CLI 21.0.1 or higher

### Starting the Development Server

```bash
npm start
```

This command starts the Angular development server. The application will be available at `http://localhost:4200`.

### Building the Application

#### Production Build
```bash
npm run build
```

This creates an optimized production build in the `dist/parker/browser` directory.

#### Development Build with Watch Mode
```bash
npm run watch
```

This builds the application in development mode and watches for file changes, automatically rebuilding when files are modified.

### Running Tests

```bash
npm test
```

Runs the test suite using Vitest.

## Docker Commands

### Building the Docker Image

```bash
docker build -t pms-parker-frontend:latest .
```

Or with a specific tag:
```bash
docker build -t pms-parker-frontend:v1.0.0 .
```

### Running the Container Locally

```bash
docker run -d -p 8086:80 --name parker-frontend pms-parker-frontend:latest
```

The application will be available at `http://localhost:8086`.

### Stopping and Removing the Container

```bash
docker stop parker-frontend
docker rm parker-frontend
```

### Viewing Container Logs

```bash
docker logs parker-frontend
```

For real-time logs:
```bash
docker logs -f parker-frontend
```

## Deployment Scripts

### Manual Deployment to Docker Swarm

#### Prerequisites
- Docker Swarm must be initialized
- The `pms-network` network must exist
- Docker login credentials configured

#### Step 1: Verify Docker Swarm Status
```bash
docker info --format '{{.Swarm.LocalNodeState}}'
```

Expected output: `active`

#### Step 2: Login to Docker Registry
```bash
docker login -u <DOCKER_USER> -p <DOCKER_PASS>
```

#### Step 3: Build and Tag the Image
```bash
export IMAGE_TAG=pms-parker-frontend:latest
docker build -t ${IMAGE_TAG} .
docker tag ${IMAGE_TAG} wagihh/pms-parker-frontend:latest
```

#### Step 4: Push to Registry (if needed)
```bash
docker push wagihh/pms-parker-frontend:latest
```

#### Step 5: Deploy Stack
```bash
export IMAGE_TAG=wagihh/pms-parker-frontend:latest
docker stack deploy -c docker-compose.yml pms-parker
```

#### Step 6: Verify Deployment
```bash
docker service ls | grep pms-parker
docker service ps pms-parker_parker-frontend
```

### Rolling Back Deployment

If you need to rollback to a previous version:

```bash
export PREVIOUS_IMAGE=wagihh/pms-parker-frontend:<previous-version>
export IMAGE_TAG=${PREVIOUS_IMAGE}
docker stack deploy -c docker-compose.yml pms-parker
```

### Checking Service Health

```bash
docker service ps pms-parker_parker-frontend --filter "desired-state=running"
```

Check if services are running:
```bash
RUNNING=$(docker service ps pms-parker_parker-frontend \
  --filter "desired-state=running" \
  --format "{{.CurrentState}}" | grep Running | wc -l)

if [ "$RUNNING" -lt 1 ]; then
  echo "Service is not running"
else
  echo "Service is running"
fi
```

### Removing the Stack

```bash
docker stack rm pms-parker
```

**Note:** This will remove all services in the stack. Make sure you have backups or can redeploy.

## Utility Scripts

### Checking Network Connectivity

Verify that the `pms-network` exists:
```bash
docker network ls | grep pms-network
```

Inspect the network:
```bash
docker network inspect pms-network
```

### Viewing Service Logs

```bash
docker service logs pms-parker_parker-frontend
```

For real-time logs:
```bash
docker service logs -f pms-parker_parker-frontend
```

### Scaling the Service

Scale the service to 3 replicas:
```bash
docker service scale pms-parker_parker-frontend=3
```

### Updating Service Configuration

After modifying `docker-compose.yml`, redeploy:
```bash
docker stack deploy -c docker-compose.yml pms-parker
```

### Cleaning Up

Remove unused images:
```bash
docker image prune -a
```

Remove unused volumes:
```bash
docker volume prune
```

Remove unused networks (be careful with this):
```bash
docker network prune
```

## Troubleshooting

### Service Not Starting

1. Check service status:
   ```bash
   docker service ps pms-parker_parker-frontend --no-trunc
   ```

2. Check logs:
   ```bash
   docker service logs pms-parker_parker-frontend
   ```

3. Verify network exists:
   ```bash
   docker network inspect pms-network
   ```

### Port Already in Use

If port 8086 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8087:80"  # Change 8086 to 8087
```

### Image Not Found

If you get an "image not found" error:
1. Verify the image exists: `docker images | grep pms-parker-frontend`
2. Check if you need to pull from registry: `docker pull wagihh/pms-parker-frontend:latest`
3. Verify IMAGE_TAG environment variable is set correctly

## Environment Variables

### For Local Development
No environment variables are required for local development.

### For Docker Deployment
- `IMAGE_TAG`: The Docker image tag to deploy (e.g., `wagihh/pms-parker-frontend:latest`)

Set it before deployment:
```bash
export IMAGE_TAG=wagihh/pms-parker-frontend:latest
```

