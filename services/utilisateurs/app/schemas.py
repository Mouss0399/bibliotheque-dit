from enum import Enum
from pydantic import BaseModel, EmailStr

class UserRole(str, Enum):
    ETUDIANT = "Etudiant"
    PROFESSEUR = "Professeur"
    ADMINISTRATIF = "Personnel"

class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    type_utilisateur: str

class UserResponse(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    type_utilisateur: str

    class Config:
        from_attributes = True
