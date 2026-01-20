from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.schemas import FaceEmbeddingRequest, FaceEmbeddingResponse
from app.blink import count_blinks_logic 
from app.face import extract_embedding, verify_face_logic 

app = FastAPI(
    title="Face Recognition API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

#REGISTER 
@app.post("/face/embedding", response_model=FaceEmbeddingResponse)
def create_embedding(payload: FaceEmbeddingRequest):
    try:
        data = extract_embedding(payload.image)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

#VERIFY FACE 
@app.post("/face/verify")
async def verify_face(payload: dict):
    try:
        image_base64 = payload.get("image")
        
        saved_embeddings = payload.get("saved_embeddings") 
        
        if not saved_embeddings:
            raise HTTPException(status_code=400, detail="No saved face data found")

       
        result = verify_face_logic(image_base64, saved_embeddings)
        
        return result 
    except Exception as e:
        print(f"Error Verify: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/blink/count")
async def count_blinks(video: UploadFile = File(...)):
    try:
        video_bytes = await video.read()
        
        blink_count = count_blinks_logic(video_bytes)
        
        return {"count": blink_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)