from datetime import datetime
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON


class Doctor(SQLModel, table=True):
    __tablename__ = "doctors"

    id: int | None = Field(default=None, primary_key=True)
    clinic_id: int = Field(foreign_key="clinics.id", index=True)
    name: str
    specialty: str
    bio: str | None = None
    available_days: list | None = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
