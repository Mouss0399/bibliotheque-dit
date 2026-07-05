from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Connexion à PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/bibliotheque")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Table Livre
class Livre(Base):
    __tablename__ = "livres"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, nullable=False)
    auteur = Column(String, nullable=False)
    isbn = Column(String, unique=True, nullable=False)
    disponible = Column(Integer, default=1)  # 1 = disponible, 0 = emprunté

# Créer les tables
Base.metadata.create_all(bind=engine)