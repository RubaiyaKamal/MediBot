from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@medibot.pk"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"

    class Config:
        env_file = ".env"


settings = Settings()
