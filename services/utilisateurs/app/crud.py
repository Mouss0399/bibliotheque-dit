from sqlalchemy.orm import Session
from .models import Utilisateur
from .schemas import UserCreate


def create_user(db: Session, user: UserCreate):
    db_user = Utilisateur(
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        type_utilisateur=user.type_utilisateur
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users(db: Session):
    return db.query(Utilisateur).all()


def get_user_by_id(db: Session, user_id: int):
    return db.query(Utilisateur).filter(Utilisateur.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(Utilisateur).filter(Utilisateur.email == email).first()