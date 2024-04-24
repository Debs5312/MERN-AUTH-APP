pipeline {
    agent any

    stages {
        stage('Clone Code') {
            steps {
                echo 'Cloning the code.'
                git url:"https://github.com/Debs5312/MERN-AUTH-APP.git", branch: "Jenkins-test"
            }
        }
        stage('Build API Image') {
            steps {
                echo 'Building API Image'
                dir("./authAPI"){
                    sh "pwd"
                    sh "docker build -t node-auth-api ."
                }
                
            }
        }
        stage('Build UI Image') {
            steps {
                echo 'Building UI Image'
                dir("./client"){
                    sh "pwd"
                    sh "docker build -t node-auth-ui ."
                }
                
            }
        }
        stage('PUsh to hub') {
            steps {
                echo 'Building the code'
                withCredentials([usernamePassword(credentialsId:"dockerhub-creds",passwordVariable:"dockerHubPass",usernameVariable:"dockerHubUsername")]){
                    sh "docker tag node-auth-api ${env.dockerHubUsername}/node-auth-api:latest"
                    sh "docker tag node-auth-ui ${env.dockerHubUsername}/node-auth-ui:latest"
                    sh "docker login -u ${env.dockerHubUsername} -p ${env.dockerHubPass}"
                    sh "docker push ${env.dockerHubUsername}/node-auth-api:latest"
                    sh "docker push ${env.dockerHubUsername}/node-auth-ui:latest"
                }
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploy Container'
                sh "docker compose down && docker compose up -d"
            }
        }
    }
}

