from pydantic import BaseModel
from typing import List


class FaceEmbeddingRequest(BaseModel):
    image: str  # menerima base64 string


class FaceEmbeddingResponse(BaseModel):
    embedding: List[float]
    embedding_arcface: List[float]
    embedding_h5: List[float]
    model: str
    dimensions: int