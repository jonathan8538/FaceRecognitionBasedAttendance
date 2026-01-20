import os
import cv2
import numpy as np
import tempfile

def count_blinks_logic(video_bytes):
    import tensorflow as tf
    
    BASE_PATH = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    BLINK_MODEL_PATH = os.path.join(BASE_PATH, "scratch", "blink_lstm_model.keras")
    
    model = tf.keras.models.load_model(BLINK_MODEL_PATH, compile=False)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_video:
        temp_video.write(video_bytes)
        temp_path = temp_video.name

    cap = cv2.VideoCapture(temp_path)
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        img = cv2.resize(frame, (64, 64)) 
        img = img / 255.0
        frames.append(img)
    cap.release()
    
    if os.path.exists(temp_path):
        os.unlink(temp_path)

    blink_count = 0
    if len(frames) > 0:
        input_data = np.array([frames], dtype=np.float32)
        prediction = model.predict(input_data, verbose=0)
        blink_count = int(np.sum(prediction > 0.5)) 
        
    return blink_count