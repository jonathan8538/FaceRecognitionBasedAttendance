import base64
import numpy as np
import cv2

def base64_to_cv2(base64_image: str):
    """
    Convert base64 image to OpenCV BGR image
    """
    if "," in base64_image:
        base64_image = base64_image.split(",")[1]

    img_bytes = base64.b64decode(base64_image)
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image data")

    return img
