from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from models import Emprunt, SessionLocal, engine, Base

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

# Schéma de validation
class EmpruntSchema(BaseModel):
    livre_id: int
    utilisateur_id: int
    date_retour_prevue: datetime

# Connexion à la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Emprunter un livre
@app.post("/emprunts")
def emprunter(emprunt: EmpruntSchema, db: Session = Depends(get_db)):
    nouveau = Emprunt(
        livre_id=emprunt.livre_id,
        utilisateur_id=emprunt.utilisateur_id,
        date_retour_prevue=emprunt.date_retour_prevue
    )
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

# Retourner un livre
@app.put("/emprunts/{id}/retour")
def retourner(id: int, db: Session = Depends(get_db)):
    emprunt = db.query(Emprunt).filter(Emprunt.id == id).first()
    if not emprunt:
        raise HTTPException(status_code=404, detail="Emprunt non trouvé")
    if emprunt.date_retour_effective:
        raise HTTPException(status_code=400, detail="Livre déjà retourné")
    emprunt.date_retour_effective = datetime.utcnow()
    db.commit()
    return emprunt

# Historique des emprunts
@app.get("/emprunts")
def get_emprunts(db: Session = Depends(get_db)):
    return db.query(Emprunt).all()

# Emprunts d'un utilisateur
@app.get("/emprunts/utilisateur/{utilisateur_id}")
def get_emprunts_utilisateur(utilisateur_id: int, db: Session = Depends(get_db)):
    return db.query(Emprunt).filter(Emprunt.utilisateur_id == utilisateur_id).all()

# Détection des retards
@app.get("/emprunts/retards")
def get_retards(db: Session = Depends(get_db)):
    maintenant = datetime.utcnow()
    retards = db.query(Emprunt).filter(
        Emprunt.date_retour_prevue < maintenant,
        Emprunt.date_retour_effective == None
    ).all()
    return retards