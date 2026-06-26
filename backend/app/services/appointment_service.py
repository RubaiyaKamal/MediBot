import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlmodel import Session
from app.models.appointment import Appointment
from app.core.config import settings


def create_appointment(session: Session, data: dict) -> Appointment:
    appt = Appointment(**data)
    session.add(appt)
    session.commit()
    session.refresh(appt)
    _send_confirmation_email(appt)
    return appt


def _send_confirmation_email(appt: Appointment):
    if not appt.patient_email or not settings.MAIL_USERNAME:
        return
    try:
        is_urdu = appt.language == "ur"
        subject = "تصدیق — MediBot اپوائنٹمنٹ" if is_urdu else "Appointment Confirmation — MediBot"
        if is_urdu:
            body = (
                f"محترم {appt.patient_name}،\n\n"
                f"آپ کی اپوائنٹمنٹ کی تصدیق ہو گئی ہے۔\n"
                f"تاریخ: {appt.appointment_date}\n"
                f"وقت: {appt.appointment_time}\n"
                f"وجہ: {appt.reason or 'N/A'}\n\n"
                f"منسوخ کرنے کے لیے کلینک سے رابطہ کریں۔\n\nشکریہ — MediBot"
            )
        else:
            body = (
                f"Dear {appt.patient_name},\n\n"
                f"Your appointment has been confirmed.\n"
                f"Date: {appt.appointment_date}\n"
                f"Time: {appt.appointment_time}\n"
                f"Reason: {appt.reason or 'N/A'}\n\n"
                f"To cancel, please contact the clinic.\n\nThank you — MediBot"
            )

        msg = MIMEMultipart()
        msg["From"] = settings.MAIL_FROM
        msg["To"] = appt.patient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.sendmail(settings.MAIL_FROM, appt.patient_email, msg.as_string())
    except Exception:
        pass
