from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import Utilisateur, SessionLocal, engine, Base

app = FastAPI()

# Autoriser les appels depuis le frontend (autre origine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Créer les tables au démarrage
Base.metadata.create_all(bind=engine)

# Schéma de validation des données
class UtilisateurSchema(BaseModel):
    nom: str
    prenom: str
    email: str
    type_utilisateur: str  # Etudiant, Professeur, Personnel

# Connexion à la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lister tous les utilisateurs
@app.get("/utilisateurs")
def get_utilisateurs(db: Session = Depends(get_db)):
    return db.query(Utilisateur).all()

# Créer un utilisateur
@app.post("/utilisateurs")
def create_utilisateur(utilisateur: UtilisateurSchema, db: Session = Depends(get_db)):
    # Vérifier si l'email existe déjà
    existing = db.query(Utilisateur).filter(Utilisateur.email == utilisateur.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    nouveau = Utilisateur(
        nom=utilisateur.nom,
        prenom=utilisateur.prenom,
        email=utilisateur.email,
        type_utilisateur=utilisateur.type_utilisateur
    )
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

# Consulter le profil d'un utilisateur
@app.get("/utilisateurs/{id}")
def get_utilisateur(id: int, db: Session = Depends(get_db)):
    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur

# Modifier un utilisateur
@app.put("/utilisateurs/{id}")
def update_utilisateur(id: int, utilisateur: UtilisateurSchema, db: Session = Depends(get_db)):
    existing = db.query(Utilisateur).filter(Utilisateur.id == id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    existing.nom = utilisateur.nom
    existing.prenom = utilisateur.prenom
    existing.email = utilisateur.email
    existing.type_utilisateur = utilisateur.type_utilisateur
    db.commit()
    return existing
 
# Supprimer un utilisateur
@app.delete("/utilisateurs/{id}")
def delete_utilisateur(id: int, db: Session = Depends(get_db)):
    existing = db.query(Utilisateur).filter(Utilisateur.id == id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    db.delete(existing)
    db.commit()
    return {"message": "Utilisateur supprimé"}