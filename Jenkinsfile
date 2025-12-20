pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_LATEST = "pms-parker-frontend:latest"
        IMAGE_BACKUP = "pms-parker-frontend:previous"
        STACK_NAME   = "pms_parker"
    }

    stages {

        stage('Checkout Parker Frontend') {
            steps {
                git(
                    url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Parker.git',
                    branch: 'feature/docker-swarm',
                    credentialsId: 'github-pat-wagih'
                )
            }
        }

        stage('Backup Current Image (Rollback Prep)') {
            steps {
                sh '''
                  if docker image inspect ${IMAGE_LATEST} > /dev/null 2>&1; then
                      echo "Backing up image"
                      docker tag ${IMAGE_LATEST} ${IMAGE_BACKUP}
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
            echo "✅ Parker Frontend deployed with Docker Swarm (3 replicas, load balanced)"
        }

        failure {
            echo "❌ Deployment failed — rolling back"

            sh '''
              if docker image inspect ${IMAGE_BACKUP} > /dev/null 2>&1; then
                  docker tag ${IMAGE_BACKUP} ${IMAGE_LATEST}
                  docker stack deploy -c docker-compose.yml ${STACK_NAME}
                  echo "🔁 Rollback completed"
              else
                  echo "⚠️ No backup image available"
              fi
            '''
        }
    }
}

