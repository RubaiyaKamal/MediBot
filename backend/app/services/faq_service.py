from sqlmodel import Session, select
from app.models.faq import FAQ


def search_faq(session: Session, clinic_id: int, query: str, lang: str = "en") -> str | None:
    faqs = session.exec(select(FAQ).where(FAQ.clinic_id == clinic_id)).all()
    query_lower = query.lower()
    for faq in faqs:
        if faq.question_en and query_lower in faq.question_en.lower():
            return faq.answer_ur if lang == "ur" and faq.answer_ur else faq.answer_en
        if faq.question_ur and query_lower in (faq.question_ur or "").lower():
            return faq.answer_ur if lang == "ur" and faq.answer_ur else faq.answer_en
    return None


def get_all_faqs_for_context(session: Session, clinic_id: int) -> list[dict]:
    faqs = session.exec(select(FAQ).where(FAQ.clinic_id == clinic_id)).all()
    return [
        {"question_en": f.question_en, "answer_en": f.answer_en,
         "question_ur": f.question_ur, "answer_ur": f.answer_ur}
        for f in faqs
    ]
