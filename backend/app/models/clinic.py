from datetime import datetime
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON


class Clinic(SQLModel, table=True):
    __tablename__ = "clinics"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    address: str
    phone: str
    email: str
    opening_hours: dict | None = Field(default=None, sa_column=Column(JSON))
    timezone: str = Field(default="Asia/Karachi")
    logo_url: str | None = None
    admin_password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
