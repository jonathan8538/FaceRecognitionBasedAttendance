from deepface import DeepFace
from app.utils import base64_to_cv2

MODEL_NAME = "ArcFace"
DETECTOR = "retinaface"

def extract_embedding(base64_image: str):
    img = base64_to_cv2(base64_image)

    result = DeepFace.represent(
        img_path=img,
        model_name=MODEL_NAME,
        detector_backend=DETECTOR,
        enforce_detection=True,
        align=True
    )

    embedding = result[0]["embedding"]

    return {
        "embedding": embedding,
        "model": MODEL_NAME,
        "dimensions": len(embedding)
    }
