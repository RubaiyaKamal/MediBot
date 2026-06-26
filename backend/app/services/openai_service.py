import json
from datetime import date
from openai import OpenAI
from sqlmodel import Session, select
from app.core.config import settings
from app.models.clinic import Clinic
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.conversation import Conversation, Message
from app.services.appointment_service import create_appointment
from app.services.faq_service import get_all_faqs_for_context

client = OpenAI(api_key=settings.OPENAI_API_KEY)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "list_doctors",
            "description": "Returns available doctors and their specialties at the clinic.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_clinic_info",
            "description": "Returns clinic address, phone, opening hours.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Check if a doctor is available on a given date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {"type": "integer", "description": "Doctor ID"},
                    "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                },
                "required": ["doctor_id", "date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Book an appointment for the patient.",
            "parameters": {
                "type": "object",
                "properties": {
                    "patient_name": {"type": "string"},
                    "patient_phone": {"type": "string"},
                    "patient_email": {"type": "string"},
                    "doctor_id": {"type": "integer"},
                    "appointment_date": {"type": "string", "description": "YYYY-MM-DD"},
                    "appointment_time": {"type": "string", "description": "HH:MM"},
                    "reason": {"type": "string"},
                },
                "required": ["patient_name", "patient_phone", "appointment_date", "appointment_time"],
            },
        },
    },
]


def _build_system_prompt(clinic: Clinic, faqs: list[dict]) -> str:
    faq_block = "\n".join(
        f"Q: {f['question_en']} | A: {f['answer_en']}" for f in faqs[:20]
    )
    return f"""You are MediBot, the friendly virtual assistant for {clinic.name}.
You help patients book appointments, answer questions about the clinic, and handle basic symptom queries.
Always be clear, calm, and professional. Never diagnose — always recommend seeing a doctor for medical concerns.
For emergencies, direct the patient to call 1122 or 115 immediately.

You speak both English and Urdu fluently. Detect the patient's language from their first message and respond in the same language throughout. If they write in Roman Urdu or Nastaliq Urdu script, reply in Urdu.

Clinic details:
- Name: {clinic.name}
- Address: {clinic.address}
- Phone: {clinic.phone}
- Hours: {json.dumps(clinic.opening_hours or {})}

Frequently Asked Questions:
{faq_block if faq_block else "No FAQs configured yet."}

When booking an appointment, collect: patient name, phone number, preferred doctor, date, time, and reason for visit. Confirm all details before calling book_appointment.
"""


def _execute_tool(name: str, args: dict, clinic_id: int, session: Session, lang: str) -> str:
    if name == "list_doctors":
        doctors = session.exec(select(Doctor).where(Doctor.clinic_id == clinic_id)).all()
        if not doctors:
            return "No doctors registered yet."
        return "\n".join(f"- Dr. {d.name} ({d.specialty}), ID: {d.id}" for d in doctors)

    elif name == "get_clinic_info":
        clinic = session.get(Clinic, clinic_id)
        if not clinic:
            return "Clinic not found."
        return f"Address: {clinic.address}\nPhone: {clinic.phone}\nHours: {json.dumps(clinic.opening_hours or {})}"

    elif name == "check_availability":
        doctor = session.get(Doctor, args.get("doctor_id"))
        if not doctor:
            return "Doctor not found."
        req_date = args.get("date", "")
        try:
            day_name = date.fromisoformat(req_date).strftime("%A")
        except ValueError:
            return "Invalid date format."
        available = doctor.available_days and day_name in doctor.available_days
        if available:
            return f"Dr. {doctor.name} is available on {req_date} ({day_name})."
        return f"Dr. {doctor.name} is not available on {req_date} ({day_name})."

    elif name == "book_appointment":
        try:
            from datetime import date as date_type
            # Resolve doctor_id by name if GPT passed doctor_name instead of id
            doctor_id = args.get("doctor_id")
            if not doctor_id and args.get("doctor_name"):
                doc = session.exec(
                    select(Doctor).where(
                        Doctor.clinic_id == clinic_id,
                        Doctor.name.ilike(f"%{args['doctor_name']}%")
                    )
                ).first()
                doctor_id = doc.id if doc else None

            # Coerce date string to date object
            appt_date = args.get("appointment_date")
            if isinstance(appt_date, str):
                appt_date = date_type.fromisoformat(appt_date)

            # Only pass valid Appointment fields
            clean_data = {
                "clinic_id": clinic_id,
                "language": lang,
                "patient_name": args.get("patient_name", ""),
                "patient_phone": args.get("patient_phone", ""),
                "patient_email": args.get("patient_email"),
                "appointment_date": appt_date,
                "appointment_time": args.get("appointment_time", ""),
                "reason": args.get("reason"),
                "doctor_id": doctor_id,
            }
            appt = create_appointment(session, clean_data)
            if lang == "ur":
                return f"اپوائنٹمنٹ بک ہو گئی ہے (ID: {appt.id})۔ {appt.appointment_date} کو {appt.appointment_time} بجے ملیں۔"
            return f"Appointment confirmed! ✅ ID: #{appt.id} — {appt.appointment_date} at {appt.appointment_time}. See you soon!"
        except Exception as e:
            return f"Booking failed: {str(e)}"

    return "Unknown function."


def get_chat_response(
    clinic_id: int,
    session_id: str,
    user_message: str,
    session: Session,
) -> tuple[str, list[str]]:
    clinic = session.get(Clinic, clinic_id)
    if not clinic:
        return "Clinic not found.", []

    # Detect language hint (simple heuristic; GPT handles actual detection)
    lang = "ur" if any(ord(c) > 1536 for c in user_message) else "en"

    # Get or create conversation
    conv = session.exec(select(Conversation).where(Conversation.session_id == session_id)).first()
    if not conv:
        conv = Conversation(clinic_id=clinic_id, session_id=session_id)
        session.add(conv)
        session.commit()
        session.refresh(conv)

    # Load history
    history = session.exec(
        select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
    ).all()

    faqs = get_all_faqs_for_context(session, clinic_id)
    system_prompt = _build_system_prompt(clinic, faqs)

    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": user_message})

    # Persist user message
    session.add(Message(conversation_id=conv.id, role="user", content=user_message))
    session.commit()

    # Call GPT-4o with tool use loop
    final_reply = ""
    for _ in range(5):
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        choice = response.choices[0]

        if choice.finish_reason == "tool_calls":
            messages.append(choice.message)
            for tool_call in choice.message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                result = _execute_tool(fn_name, fn_args, clinic_id, session, lang)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                })
        else:
            final_reply = choice.message.content or ""
            break

    # Persist assistant reply
    if final_reply:
        session.add(Message(conversation_id=conv.id, role="assistant", content=final_reply))
        session.commit()

    quick_replies = _suggest_quick_replies(final_reply, lang)
    return final_reply, quick_replies


def _suggest_quick_replies(reply: str, lang: str) -> list[str]:
    reply_lower = reply.lower()
    if lang == "ur":
        if "اپوائنٹمنٹ" in reply:
            return ["نئی اپوائنٹمنٹ", "ڈاکٹرز دیکھیں", "اوقات کار"]
        return ["اپوائنٹمنٹ بک کریں", "ڈاکٹرز دیکھیں", "کلینک کی معلومات"]
    if "appointment" in reply_lower:
        return ["Book another", "View doctors", "Opening hours"]
    return ["Book appointment", "View doctors", "Clinic info"]
