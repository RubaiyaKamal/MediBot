from datetime import datetime, date
from sqlmodel import Field, SQLModel


class Appointment(SQLModel, table=True):
    __tablename__ = "appointments"

    id: int | None = Field(default=None, primary_key=True)
    clinic_id: int = Field(foreign_key="clinics.id", index=True)
    doctor_id: int | None = Field(default=None, foreign_key="doctors.id")
    patient_name: str
    patient_phone: str
    patient_email: str | None = None
    appointment_date: date
    appointment_time: str
    reason: str | None = None
    status: str = Field(default="pending")
    language: str = Field(default="en")
    created_at: datetime = Field(default_factory=datetime.utcnow)
