from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from models import Feedback
from schemas import FeedbackCreate, FeedbackUpdate
from typing import Optional


def get_all_feedback(db: Session):
    return db.query(Feedback).order_by(Feedback.submitted_at.desc()).all()


def get_feedback_by_id(db: Session, feedback_id: int):
    return db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()


def create_feedback(db: Session, feedback: FeedbackCreate):
    db_feedback = Feedback(**feedback.dict())
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def update_feedback(db: Session, feedback_id: int, feedback: FeedbackUpdate):
    db_feedback = get_feedback_by_id(db, feedback_id)
    if not db_feedback:
        return None
    for key, value in feedback.dict(exclude_unset=True).items():
        setattr(db_feedback, key, value)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def delete_feedback(db: Session, feedback_id: int):
    db_feedback = get_feedback_by_id(db, feedback_id)
    if not db_feedback:
        return None
    db.delete(db_feedback)
    db.commit()
    return db_feedback


def search_feedback(
    db: Session,
    keyword: Optional[str] = None,
    rating: Optional[int] = None,
    program_name: Optional[str] = None,
):
    query = db.query(Feedback)
    if keyword:
        kw = f"%{keyword.lower()}%"
        query = query.filter(
            or_(
                func.lower(Feedback.participant_name).like(kw),
                func.lower(Feedback.comments).like(kw),
                func.lower(Feedback.program_name).like(kw),
            )
        )
    if rating:
        query = query.filter(Feedback.rating == rating)
    if program_name:
        pn = f"%{program_name.lower()}%"
        query = query.filter(func.lower(Feedback.program_name).like(pn))
    return query.order_by(Feedback.submitted_at.desc()).all()
