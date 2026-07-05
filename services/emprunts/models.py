from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
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

class Emprunt(Base):
    __tablename__ = "emprunts"
    id = Column(Integer, primary_key=True, index=True)
    livre_id = Column(Integer, nullable=False)
    utilisateur_id = Column(Integer, nullable=False)
    date_emprunt = Column(DateTime, default=datetime.utcnow)
    date_retour_prevue = Column(DateTime, nullable=False)
    date_retour_effective = Column(DateTime, nullable=True)

Base.metadata.create_all(bind=engine)