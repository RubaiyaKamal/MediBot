from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import verify_token
from app.models.doctor import Doctor

router = APIRouter(prefix="/doctors", tags=["doctors"])


class DoctorCreate(BaseModel):
    clinic_id: int
    name: str
    specialty: str
    bio: str | None = None
    available_days: list[str] | None = None


class DoctorUpdate(BaseModel):
    name: str | None = None
    specialty: str | None = None
    bio: str | None = None
    available_days: list[str] | None = None


@router.get("")
def list_doctors(clinic_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Doctor).where(Doctor.clinic_id == clinic_id)).all()


@router.post("", status_code=201)
def create_doctor(
    body: DoctorCreate,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    doctor = Doctor(**body.model_dump())
    session.add(doctor)
    session.commit()
    session.refresh(doctor)
    return doctor


@router.patch("/{doctor_id}")
def update_doctor(
    doctor_id: int,
    body: DoctorUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    doctor = session.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(doctor, field, value)
    session.add(doctor)
    session.commit()
    session.refresh(doctor)
    return doctor


@router.delete("/{doctor_id}", status_code=204)
def delete_doctor(
    doctor_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    doctor = session.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    session.delete(doctor)
    session.commit()
