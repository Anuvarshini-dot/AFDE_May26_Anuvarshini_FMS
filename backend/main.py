from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import feedback
from routers import etl

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Feedback Management System", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router)
app.include_router(etl.router)


@app.get("/")
def root():
    return {"message": "Feedback Management System API v2"}
