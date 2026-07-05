from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/bibliotheque")

def wait_for_db():
    import psycopg2
    while True:
        try:
            conn = psycopg2.connect(DATABASE_URL)
            conn.close()
            print("Base de données prête !")
            break
        except psycopg2.OperationalError:
            print("⏳ Attente de la base de données...")
            time.sleep(2)

wait_for_db()

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Utilisateur(Base):
    __tablename__ = "utilisateurs"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    type_utilisateur = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)