from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import verify_token, hash_password
from app.models.clinic import Clinic

router = APIRouter(prefix="/clinics", tags=["clinics"])


class ClinicCreate(BaseModel):
    name: str
    slug: str
    address: str
    phone: str
    email: str
    opening_hours: dict | None = None
    timezone: str = "Asia/Karachi"
    logo_url: str | None = None
    admin_password: str


class ClinicUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    opening_hours: dict | None = None
    logo_url: str | None = None


@router.get("")
def list_clinics(session: Session = Depends(get_session)):
    return session.exec(select(Clinic)).all()


@router.get("/{slug}")
def get_clinic(slug: str, session: Session = Depends(get_session)):
    clinic = session.exec(select(Clinic).where(Clinic.slug == slug)).first()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic


@router.post("", status_code=201)
def create_clinic(body: ClinicCreate, session: Session = Depends(get_session)):
    clinic = Clinic(
        **body.model_dump(exclude={"admin_password"}),
        admin_password_hash=hash_password(body.admin_password),
    )
    session.add(clinic)
    session.commit()
    session.refresh(clinic)
    return clinic


@router.patch("/{clinic_id}")
def update_clinic(
    clinic_id: int,
    body: ClinicUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    clinic = session.get(Clinic, clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(clinic, field, value)
    session.add(clinic)
    session.commit()
    session.refresh(clinic)
    return clinic
