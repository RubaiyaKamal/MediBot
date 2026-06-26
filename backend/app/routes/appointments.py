from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import verify_token
from app.models.appointment import Appointment

router = APIRouter(prefix="/appointments", tags=["appointments"])


class AppointmentUpdate(BaseModel):
    status: str | None = None


@router.get("")
def list_appointments(
    clinic_id: int,
    status: str | None = None,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    query = select(Appointment).where(Appointment.clinic_id == clinic_id)
    if status:
        query = query.where(Appointment.status == status)
    return session.exec(query.order_by(Appointment.appointment_date)).all()


@router.get("/{appt_id}")
def get_appointment(
    appt_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    appt = session.get(Appointment, appt_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt


@router.patch("/{appt_id}")
def update_appointment(
    appt_id: int,
    body: AppointmentUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    appt = session.get(Appointment, appt_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(appt, field, value)
    session.add(appt)
    session.commit()
    session.refresh(appt)
    return appt


@router.delete("/{appt_id}", status_code=204)
def cancel_appointment(
    appt_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    appt = session.get(Appointment, appt_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "cancelled"
    session.add(appt)
    session.commit()
