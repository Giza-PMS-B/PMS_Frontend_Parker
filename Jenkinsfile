pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_NAME     = "pms-parker-frontend"
        STACK_NAME     = "pms_parker"
        SERVICE_NAME   = "parker-frontend"
        APP_PORT       = "8086"

        BUILD_IMAGE    = "${IMAGE_NAME}:${BUILD_NUMBER}"
        LATEST_IMAGE   = "${IMAGE_NAME}:latest"
        PREVIOUS_IMAGE = ""
    }

    stages {

        stage('Checkout Parker Frontend') {
            steps {
                git(
                    url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Parker.git',
                    branch: 'deploying',
                    credentialsId: 'github-pat-wagih'
                )
            }
        }

        stage('Verify Docker Swarm') {
            steps {
                sh '''
                  STATE=$(docker info --format '{{.Swarm.LocalNodeState}}')
                  if [ "$STATE" != "active" ]; then
                    echo "Docker Swarm is not active"
                    exit 1
                  fi
                '''
            }
        }

        stage('Save Previous Image') {
            steps {
                script {
                    PREVIOUS_IMAGE = sh(
                        script: "docker service inspect ${STACK_NAME}_${SERVICE_NAME} --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' || true",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                  docker build -t ${BUILD_IMAGE} .
                  docker tag ${BUILD_IMAGE} ${LATEST_IMAGE}
                """
            }
        }

        stage('Deploy to Docker Swarm') {
            steps {
                sh """
                  IMAGE_TAG=${BUILD_IMAGE} docker stack deploy -c docker-compose.yml ${STACK_NAME}
                """
            }
        }

        stage('Health Check (Swarm Native)') {
            steps {
                sh '''
                  sleep 10

                  RUNNING=$(docker service ps ${STACK_NAME}_${SERVICE_NAME} \
                    --filter "desired-state=running" \
                    --format "{{.CurrentState}}" | grep Running | wc -l)

                  if [ "$RUNNING" -lt 1 ]; then
                    echo "Service is not running"
                    exit 1
                  fi
                '''
            }
        }
    }

    post {
        failure {
            echo "❌ Deployment failed — rolling back"

            script {
                if (PREVIOUS_IMAGE?.trim()) {
                    sh """
                      IMAGE_TAG=${PREVIOUS_IMAGE} docker stack deploy -c docker-compose.yml ${STACK_NAME}
                    """
                    echo "🔁 Rollback completed"
                } else {
                    echo "⚠️ No previous image found — rollback skipped"
                }
            }
        }

        success {
            echo "✅ Parker Frontend deployed successfully"
        }
    }
}
