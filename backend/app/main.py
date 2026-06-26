from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from app.core.database import create_db_and_tables
from app.routes import chat, auth, clinics, doctors, faqs, appointments


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="MediBot API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": traceback.format_exc()})

app.include_router(chat.router)
app.include_router(auth.router)
app.include_router(clinics.router)
app.include_router(doctors.router)
app.include_router(faqs.router)
app.include_router(appointments.router)


@app.get("/health")
def health():
    return {"status": "ok"}
