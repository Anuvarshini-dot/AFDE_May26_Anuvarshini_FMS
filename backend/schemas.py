from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class FeedbackCreate(BaseModel):
    participant_name: str
    program_name: str
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None


class FeedbackUpdate(BaseModel):
    participant_name: Optional[str] = None
    program_name: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    comments: Optional[str] = None


class FeedbackResponse(BaseModel):
    feedback_id: int
    participant_name: str
    program_name: str
    rating: int
    comments: Optional[str]
    submitted_at: datetime

    class Config:
        from_attributes = True


# ETL Schemas

class ETLRunResponse(BaseModel):
    run_id: int
    filename: str
    total_records: int
    valid_records: int
    invalid_records: int
    duplicate_records: int
    loaded_records: int
    status: str
    error_message: Optional[str]
    run_at: datetime

    class Config:
        from_attributes = True


class ProgramStat(BaseModel):
    program_name: str
    total_feedback: int
    avg_rating: float
    rating_1: int
    rating_2: int
    rating_3: int
    rating_4: int
    rating_5: int


class RatingDistribution(BaseModel):
    rating: int
    count: int


class ETLAnalyticsResponse(BaseModel):
    total_imported: int
    avg_rating: float
    total_etl_runs: int
    program_stats: List[ProgramStat]
    rating_distribution: List[RatingDistribution]
    top_program: Optional[str]
    bottom_program: Optional[str]
