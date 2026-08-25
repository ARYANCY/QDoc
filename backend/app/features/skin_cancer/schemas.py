from pydantic import BaseModel, Field


class QualitySchema(BaseModel):
    valid: bool
    reason: str | None = None
    issues: list[str] = Field(default_factory=list)


class PredictOut(BaseModel):
    request_id: str
    model: dict
    prediction: dict
    probabilities: dict[str, float]
    quality: dict
    quantum: dict | None = None
    review_required: bool = True
    disclaimer: str
