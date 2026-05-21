from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, index=True)
    participant_name = Column(String, nullable=False)
    program_name = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)


class ETLRun(Base):
    __tablename__ = "etl_runs"

    run_id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    total_records = Column(Integer, default=0)
    valid_records = Column(Integer, default=0)
    invalid_records = Column(Integer, default=0)
    duplicate_records = Column(Integer, default=0)
    loaded_records = Column(Integer, default=0)
    status = Column(String, default="pending")  # pending | success | failed
    error_message = Column(Text, nullable=True)
    run_at = Column(DateTime, default=datetime.utcnow)
