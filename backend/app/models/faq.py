from datetime import datetime
from sqlmodel import Field, SQLModel


class FAQ(SQLModel, table=True):
    __tablename__ = "faqs"

    id: int | None = Field(default=None, primary_key=True)
    clinic_id: int = Field(foreign_key="clinics.id", index=True)
    question_en: str
    question_ur: str | None = None
    answer_en: str
    answer_ur: str | None = None
    category: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
