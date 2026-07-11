pipeline {
    agent any

    stages {

        stage('Récupération du code') {
            steps {
                echo 'Récupération du code depuis GitHub...'
                checkout scm
            }
        }

        stage('Build des images Docker') {
            steps {
                echo 'Construction des images Docker...'
                sh 'docker compose build'
            }
        }

stage('Vérification') {
    steps {
        echo 'Vérification des conteneurs...'
        sh 'docker compose ps'
    }
}
        stage('Déploiement') {
            steps {
                echo 'Déploiement avec Docker Compose...'
                sh 'docker compose up -d'
            }
        }

    }

    post {
        success {
            echo 'Déploiement réussi !'
        }
        failure {
            echo 'Echec du pipeline !'
        }
    }
}