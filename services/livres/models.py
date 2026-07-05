from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/bibliotheque")

# Attendre que PostgreSQL soit prêt
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

class Livre(Base):
    __tablename__ = "livres"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, nullable=False)
    auteur = Column(String, nullable=False)
    isbn = Column(String, unique=True, nullable=False)
    disponible = Column(Integer, default=1)

Base.metadata.create_all(bind=engine)