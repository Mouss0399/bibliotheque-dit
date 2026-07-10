#  Bibliothèque Numérique DIT

Plateforme de gestion de bibliothèque numérique développée dans le cadre du Master 1 IA - DIT.

##  Architecture

L'application est basée sur une architecture microservices :

- **Service Livres** (port 8000) — Gestion des livres
- **Service Utilisateurs** (port 8001) — Gestion des utilisateurs
- **Service Emprunts** (port 8002) — Gestion des emprunts
- **Frontend** (port 3000) — Interface web
- **PostgreSQL** (port 5432) — Base de données

##  Technologies utilisées

- **Backend** : FastAPI (Python)
- **Frontend** : React + Vite
- **Base de données** : PostgreSQL
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : Jenkins

##  Installation et lancement

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut Docker Compose)
- Git

### Lancer le projet

1. Cloner le repository :
```bash
git clone https://github.com/Mouss0399/bibliotheque-dit.git
cd bibliotheque-dit
```

2. Construire les images et lancer tous les services :
```bash
docker compose up -d --build
```
`--build` n'est nécessaire que la première fois ou après une modification du code ; ensuite `docker compose up -d` suffit. Le premier lancement peut prendre quelques minutes le temps de télécharger les images de base et d'installer les dépendances.

3. Vérifier que tout tourne :
```bash
docker ps
```
5 conteneurs doivent apparaître avec le statut `Up` : `frontend`, `livres`, `utilisateurs`, `emprunts`, `db`.

4. Accéder à l'application :
- Frontend : http://localhost:3000
- API Livres : http://localhost:8000/docs
- API Utilisateurs : http://localhost:8001/docs
- API Emprunts : http://localhost:8002/docs

### Arrêter le projet
```bash
docker compose down
```
Les données (livres, utilisateurs, emprunts) sont conservées dans un volume Docker et seront toujours là au prochain lancement. Pour tout réinitialiser : `docker compose down -v`.

### Dépannage (Windows)
Si Docker Desktop reste bloqué sur "Starting the Docker Engine...", c'est généralement WSL2 qui n'est pas correctement activé. En PowerShell **administrateur** :
```powershell
wsl --install --no-distribution
```
puis redémarrez. Si le problème persiste, toujours en admin :
```powershell
bcdedit /set hypervisorlaunchtype auto
```
et redémarrez à nouveau.

##  Pipeline Jenkins

1. Créer un nouveau job Jenkins de type **Pipeline**
2. Configurer le repo GitHub dans la section **Pipeline**
3. Jenkins va automatiquement :
   - Récupérer le code depuis GitHub
   - Construire les images Docker
   - Déployer avec Docker Compose

##  Structure du projet

```
bibliotheque-dit/
├── docker-compose.yml        # Orchestration de tous les services
├── Jenkinsfile                # Pipeline CI/CD
├── frontend/                  # Application React (Vite)
│   ├── src/
│   │   ├── pages/             # Tableau de bord, Livres, Utilisateurs, Emprunts
│   │   ├── components/        # Sidebar, modales, tableaux, icônes...
│   │   └── api/                # Appels vers les 3 API backend
│   └── Dockerfile
├── services/
│   ├── livres/                 # API FastAPI — gestion des livres
│   ├── utilisateurs/           # API FastAPI — gestion des utilisateurs
│   └── emprunts/               # API FastAPI — gestion des emprunts
│       └── (chacun a son main.py, models.py, requirements.txt, Dockerfile)
└── docs/                       # Rapport du projet
```

Chaque dossier sous `services/` est un microservice indépendant avec sa propre API REST, son propre `Dockerfile`, et communique avec les autres uniquement via HTTP (jamais d'appel direct en base entre services).

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
