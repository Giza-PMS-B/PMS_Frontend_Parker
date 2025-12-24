pipeline {
    agent any

  
    environment {
        // =========================
        // Docker
        // =========================
        DOCKER_REPO  = "omareldamaty"
        IMAGE_NAME   = "pms-parker-frontend"

        IMAGE_LATEST = "${DOCKER_REPO}/${IMAGE_NAME}:latest"
        IMAGE_BACKUP = "${DOCKER_REPO}/${IMAGE_NAME}:previous"

        // =========================
        // Swarm
        // =========================
        STACK_NAME   = "pms_parker"
    }

    stages {

        stage('Checkout Parker Frontend') {
            steps {
                git(
                    url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Parker.git',
                    branch: 'latest',
                    credentialsId: 'github-pat-wagih'
                )
            }
        }

        stage('Backup Current Image (Rollback Prep)') {
            steps {
                sh '''
                  if docker image inspect ${IMAGE_LATEST} > /dev/null 2>&1; then
                      echo "Backing up current image"
                      docker tag ${IMAGE_LATEST} ${IMAGE_BACKUP}
                      docker push ${IMAGE_BACKUP}
                  else
                      echo "No previous image found"
                  fi
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                  docker build -t ${IMAGE_LATEST} .
                '''
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'Docker-PAT',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                sh '''
                  docker push ${IMAGE_LATEST}
                '''
            }
        }

        stage('Deploy to Docker Swarm') {
            steps {
                sh '''
                  docker stack deploy -c docker-compose.yml ${STACK_NAME}
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                  sleep 10
                  curl -f http://localhost:8086 || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Parker Frontend built, pushed, and deployed successfully"
        }

        failure {
            echo "❌ Deployment failed — rolling back"

            sh '''
              if docker image inspect ${IMAGE_BACKUP} > /dev/null 2>&1; then
                  docker tag ${IMAGE_BACKUP} ${IMAGE_LATEST}
                  docker push ${IMAGE_LATEST}
                  docker stack deploy -c docker-compose.yml ${STACK_NAME}
                  echo "🔁 Rollback completed"
              else
                  echo "⚠️ No backup image available"
              fi
            '''
        }
    }
}
