from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import verify_password, create_access_token
from app.models.clinic import Clinic

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    clinic_slug: str
    password: str


@router.post("/login")
def login(body: LoginRequest, session: Session = Depends(get_session)):
    clinic = session.exec(select(Clinic).where(Clinic.slug == body.clinic_slug)).first()
    if not clinic or not verify_password(body.password, clinic.admin_password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(clinic.id), "clinic_id": clinic.id})
    return {"access_token": token, "token_type": "bearer", "clinic_id": clinic.id}
