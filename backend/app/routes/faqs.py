from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import verify_token
from app.models.faq import FAQ

router = APIRouter(prefix="/faqs", tags=["faqs"])


class FAQCreate(BaseModel):
    clinic_id: int
    question_en: str
    question_ur: str | None = None
    answer_en: str
    answer_ur: str | None = None
    category: str | None = None


class FAQUpdate(BaseModel):
    question_en: str | None = None
    question_ur: str | None = None
    answer_en: str | None = None
    answer_ur: str | None = None
    category: str | None = None


@router.get("")
def list_faqs(clinic_id: int, session: Session = Depends(get_session)):
    return session.exec(select(FAQ).where(FAQ.clinic_id == clinic_id)).all()


@router.post("", status_code=201)
def create_faq(
    body: FAQCreate,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    faq = FAQ(**body.model_dump())
    session.add(faq)
    session.commit()
    session.refresh(faq)
    return faq


@router.patch("/{faq_id}")
def update_faq(
    faq_id: int,
    body: FAQUpdate,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    faq = session.get(FAQ, faq_id)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(faq, field, value)
    session.add(faq)
    session.commit()
    session.refresh(faq)
    return faq


@router.delete("/{faq_id}", status_code=204)
def delete_faq(
    faq_id: int,
    session: Session = Depends(get_session),
    _: dict = Depends(verify_token),
):
    faq = session.get(FAQ, faq_id)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    session.delete(faq)
    session.commit()
