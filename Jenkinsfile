pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_LATEST   = "pms-parker-frontend:latest"
        IMAGE_BACKUP   = "pms-parker-frontend:previous"
        CONTAINER_NAME = "pms-parker-frontend"
        APP_PORT       = "8086"
    }

    stages {

        stage('Checkout Parker Frontend') {
            steps {
                git(
                    url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Parker.git',
                    branch: 'pipeline-+-dockerization',
                    credentialsId: 'github-pat-wagih'
                )
            }
        }

        stage('Backup Current Image') {
            steps {
                sh '''
                  if docker image inspect ${IMAGE_LATEST} > /dev/null 2>&1; then
                      docker tag ${IMAGE_LATEST} ${IMAGE_BACKUP}
                  fi
                '''
            }
        }

        stage('Build Docker Image (Angular + NGINX)') {
            steps {
                sh '''
                  docker build -t ${IMAGE_LATEST} .
                '''
            }
        }

        stage('Deploy Parker Frontend') {
            steps {
                sh '''
                  set -e
                  docker rm -f ${CONTAINER_NAME} || true

                  docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p ${APP_PORT}:80 \
                    ${IMAGE_LATEST}
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                  sleep 5
                  curl -f http://localhost:${APP_PORT} || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Parker Frontend deployed successfully on port ${APP_PORT}"
        }

        failure {
            echo "❌ Deployment failed — rolling back"

            sh '''
              docker rm -f ${CONTAINER_NAME} || true

              if docker image inspect ${IMAGE_BACKUP} > /dev/null 2>&1; then
                  docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p ${APP_PORT}:80 \
                    ${IMAGE_BACKUP}
                  echo "🔁 Rollback completed"
              else
                  echo "⚠️ No backup image available"
              fi
            '''
        }
    }
}
