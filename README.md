#  Bibliothèque Numérique DIT

Plateforme de gestion de bibliothèque numérique développée dans le cadre du Master 1 IA - DIT.

##  Architecture

L'application est basée sur une architecture microservices :

- **Service Livres** (port 8000) — Gestion des livres
- **Service Utilisateurs** (port 8001) — Gestion des utilisateurs
- **Service Emprunts** (port 8002) — Gestion des emprunts
- **Frontend** (port 3000) — Interface web
- **PostgreSQL** (port 5432) — Base de données

## 🛠️ Technologies utilisées

- **Backend** : FastAPI (Python)
- **Frontend** : HTML / CSS / JavaScript
- **Base de données** : PostgreSQL
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : Jenkins

##  Installation et lancement

### Prérequis
- Docker
- Docker Compose

### Lancer le projet

1. Cloner le repository :
```bash
git clone https://github.com/Mouss0399/bibliotheque-dit.git
cd bibliotheque-dit
```

2. Lancer tous les services :
```bash
docker compose up -d
```

3. Accéder à l'application :
- Frontend : http://localhost:3000
- API Livres : http://localhost:8000/docs
- API Utilisateurs : http://localhost:8001/docs
- API Emprunts : http://localhost:8002/docs

### Arrêter le projet
```bash
docker compose down
```

##  Pipeline Jenkins

1. Créer un nouveau job Jenkins de type **Pipeline**
2. Configurer le repo GitHub dans la section **Pipeline**
3. Jenkins va automatiquement :
   - Récupérer le code depuis GitHub
   - Construire les images Docker
   - Déployer avec Docker Compose

##  Structure du projet
##  Équipe

| Nom | Rôle |
|-----|------|
| OMAR Moussa | Chef de projet, docker-compose.yml, Jenkinsfile |
| COLY Ousmane | Service Livres |
| DIA Adji Ndioba | Service Utilisateurs |
| DIA Amadou Daouda | Service Emprunts |
| DIACK Mariam Bocar | Frontend |
| DIAKITE Mamadou Daye | Dockerfiles + PostgreSQL |
| DIALLO Salou | README + Rapport PDF |