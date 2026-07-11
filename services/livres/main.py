from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import Livre, SessionLocal, engine, Base

app = FastAPI()

# Autoriser les appels depuis le frontend (autre origine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# Health check
@app.get("/health")
def health():
    return {"status": "ok", "service": "livres"}

# Créer les tables au démarrage
Base.metadata.create_all(bind=engine)

# Schéma de validation des données
class LivreSchema(BaseModel):
    titre: str
    auteur: str
    isbn: str

# Connexion à la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lister tous les livres
@app.get("/livres")
def get_livres(db: Session = Depends(get_db)):
    return db.query(Livre).all()

# Ajouter un livre
@app.post("/livres")
def add_livre(livre: LivreSchema, db: Session = Depends(get_db)):
    if db.query(Livre).filter(Livre.isbn == livre.isbn).first():
        raise HTTPException(status_code=400, detail="ISBN déjà utilisé")
    nouveau = Livre(titre=livre.titre, auteur=livre.auteur, isbn=livre.isbn)
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

# Modifier un livre
@app.put("/livres/{id}")
def update_livre(id: int, livre: LivreSchema, db: Session = Depends(get_db)):
    existing = db.query(Livre).filter(Livre.id == id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    doublon = db.query(Livre).filter(Livre.isbn == livre.isbn, Livre.id != id).first()
    if doublon:
        raise HTTPException(status_code=400, detail="ISBN déjà utilisé")
    existing.titre = livre.titre
    existing.auteur = livre.auteur
    existing.isbn = livre.isbn
    db.commit()
    db.refresh(existing)
    return existing

# Supprimer un livre
@app.delete("/livres/{id}")
def delete_livre(id: int, db: Session = Depends(get_db)):
    existing = db.query(Livre).filter(Livre.id == id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    db.delete(existing)
    db.commit()
    return {"message": "Livre supprimé"}

# Rechercher par titre, auteur ou ISBN
@app.get("/livres/recherche")
def recherche(q: str, db: Session = Depends(get_db)):
    resultats = db.query(Livre).filter(
        Livre.titre.ilike(f"%{q}%") |
        Livre.auteur.ilike(f"%{q}%") |
        Livre.isbn.ilike(f"%{q}%")
    ).all()
    return resultats