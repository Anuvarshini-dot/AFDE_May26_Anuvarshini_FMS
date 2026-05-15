from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import crud
from schemas import FeedbackCreate, FeedbackUpdate, FeedbackResponse

router = APIRouter()


@router.get("/feedback", response_model=List[FeedbackResponse])
def get_all_feedback(db: Session = Depends(get_db)):
    return crud.get_all_feedback(db)


@router.get("/feedback/{feedback_id}", response_model=FeedbackResponse)
def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = crud.get_feedback_by_id(db, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    return crud.create_feedback(db, feedback)


@router.put("/feedback/{feedback_id}", response_model=FeedbackResponse)
def update_feedback(feedback_id: int, feedback: FeedbackUpdate, db: Session = Depends(get_db)):
    updated = crud.update_feedback(db, feedback_id, feedback)
    if not updated:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return updated


@router.delete("/feedback/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_feedback(db, feedback_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return {"message": "Feedback deleted successfully"}


@router.get("/search", response_model=List[FeedbackResponse])
def search_feedback(
    keyword: Optional[str] = None,
    rating: Optional[int] = None,
    program_name: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return crud.search_feedback(db, keyword, rating, program_name)
