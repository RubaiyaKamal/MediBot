from datetime import datetime
from sqlmodel import Field, SQLModel


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: int | None = Field(default=None, primary_key=True)
    clinic_id: int = Field(foreign_key="clinics.id", index=True)
    session_id: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
