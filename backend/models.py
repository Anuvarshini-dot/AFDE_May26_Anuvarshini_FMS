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
