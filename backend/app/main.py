from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import FaceEmbeddingRequest, FaceEmbeddingResponse
from app.face import extract_embedding

app = FastAPI(
    title="Face Recognition API",
    version="1.0.0"
)

# CORS (sesuaikan domain frontend kamu)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ganti ke domain frontend saat production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/face/embedding", response_model=FaceEmbeddingResponse)
def create_embedding(payload: FaceEmbeddingRequest):
    try:
        data = extract_embedding(payload.image)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
