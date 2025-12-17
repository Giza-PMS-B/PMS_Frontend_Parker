pipeline {
    agent any

    environment {
        // Frontend repo directory (inside Jenkins workspace)
        FRONTEND_DIR = "PMS_Frontend_Parker"

        // Angular build output (dynamic)
        ANGULAR_BUILD_DIR = "${WORKSPACE}/${FRONTEND_DIR}/dist/parker/browser"

        // Dynamic Ansible root (user-independent)
        ANSIBLE_ROOT = "${env.HOME}/ParkingProject"
    }

    stages {

        stage('Checkout Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    checkout scm
                }
            }
        }

        stage('Build Angular') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Frontend with Ansible') {
            steps {
                sh """
                ansible-playbook ${WORKSPACE}/setup.yml
                """
            }
        }
    }
}
