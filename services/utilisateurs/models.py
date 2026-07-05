from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Connexion à PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/bibliotheque")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Table Utilisateur
class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    type_utilisateur = Column(String, nullable=False)  # Etudiant, Professeur, Personnel

# Créer les tables
Base.metadata.create_all(bind=engine)