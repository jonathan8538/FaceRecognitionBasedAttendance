from pydantic import BaseModel
from typing import List

class FaceEmbeddingRequest(BaseModel):
    image: str  # base64 data:image/jpeg;base64,...

class FaceEmbeddingResponse(BaseModel):
    embedding: List[float]
    model: str
    dimensions: int
