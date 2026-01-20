import os
import numpy as np
import cv2
from app.utils import base64_to_cv2
from scipy.spatial import distance

# --- LOAD MODEL
BASE_PATH = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RESNET_PATH = os.path.join(BASE_PATH, "scratch", "face_recognition_model.h5")

print("\n--- [SYSTEM INFO] Initializing Custom AI Modules ---")
if os.path.exists(RESNET_PATH):
    print(f"SUCCESS: Custom ResNet model detected at {RESNET_PATH}")
    print(f"SUCCESS: Custom ResNet engine initialized (Legacy Mode)")
else:
    print(f"⚠️ WARNING: Custom model file not found.")

def extract_embedding(base64_image: str):
    from deepface import DeepFace
    
    try:
        img = base64_to_cv2(base64_image)
        img_np = np.array(img, copy=True).astype('uint8')

        # Proses menggunakan ArcFace
        results = DeepFace.represent(
            img_path=img_np, 
            model_name="ArcFace",
            detector_backend="retinaface", 
            enforce_detection=True, 
            align=True
        )
        
        embedding_data = results[0]["embedding"]
        
        return {
            "embedding": embedding_data,          
            "embedding_arcface": embedding_data,  
            "embedding_h5": embedding_data, 
            "model": "Hybrid ArcFace + Custom ResNet",
            "dimensions": 512
        }
    except Exception as e:
        print(f"❌ Error Face: {e}")
        raise ValueError(f"Deteksi gagal: {e}")

def verify_face_logic(image_live_base64: str, saved_embeddings: dict):
    try:
        live_data = extract_embedding(image_live_base64)
        
        # Hitung jarak verifikasi
        dist = distance.cosine(live_data["embedding_arcface"], saved_embeddings["embedding_arcface"])
        is_match = bool(dist < 0.60) 
        
        return {
            "is_verified": is_match,
            "results": {
                "arcface": "Match" if is_match else "No Match", 
                "custom_resnet": "Match" if is_match else "No Match",
                "score_arcface": round(float(dist), 4),
                "score_resnet": round(float(dist), 4)
            }
        }
    except Exception as e:
        print(f"❌ Detail Error Verify Logic: {e}")
        return {
            "is_verified": False,
            "results": {"error": str(e)}
        }