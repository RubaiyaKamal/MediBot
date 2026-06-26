from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
from app.services.openai_service import get_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    clinic_id: int
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    quick_replies: list[str]


@router.post("", response_model=ChatResponse)
def chat(body: ChatRequest, session: Session = Depends(get_session)):
    reply, quick_replies = get_chat_response(
        clinic_id=body.clinic_id,
        session_id=body.session_id,
        user_message=body.message,
        session=session,
    )
    return ChatResponse(reply=reply, session_id=body.session_id, quick_replies=quick_replies)
