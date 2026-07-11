from enum import Enum
from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    ETUDIANT = "ETUDIANT"
    PROFESSEUR = "PROFESSEUR"
    ADMINISTRATIF = "ADMINISTRATIF"


class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    type_utilisateur: UserRole


class UserResponse(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    type_utilisateur: UserRole

    class Config:
        from_attributes = True