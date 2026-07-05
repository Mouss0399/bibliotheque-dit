from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import Livre, SessionLocal, engine, Base

app = FastAPI()

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
    existing.titre = livre.titre
    existing.auteur = livre.auteur
    existing.isbn = livre.isbn
    db.commit()
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
        Livre.titre.contains(q) |
        Livre.auteur.contains(q) |
        Livre.isbn.contains(q)
    ).all()
    return resultats