import { FaceMesh, Results } from '@mediapipe/face_mesh';

// Indeks koordinat mata untuk MediaPipe Face Mesh
const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];

/**
 * Menghitung Eye Aspect Ratio (EAR)
 */
const calculateEAR = (landmarks: any, eyeIndices: number[]) => {
  const p = eyeIndices.map(i => landmarks[i]);
  
  // Rumus EAR: Jarak Vertikal / Jarak Horizontal
  const v1 = Math.sqrt(Math.pow(p[1].x - p[5].x, 2) + Math.pow(p[1].y - p[5].y, 2));
  const v2 = Math.sqrt(Math.pow(p[2].x - p[4].x, 2) + Math.pow(p[2].y - p[4].y, 2));
  const h = Math.sqrt(Math.pow(p[0].x - p[3].x, 2) + Math.pow(p[0].y - p[3].y, 2));

  return (v1 + v2) / (2.0 * h);
};

/**
 * Memproses video untuk menghitung berapa kali user berkedip
 */
export const countBlinksInVideo = async (videoBlob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoBlob);
    
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    let blinkCount = 0;
    let isEyeClosed = false;
    const EAR_THRESHOLD = 0.20; // Ambang batas mata dianggap tertutup
    const REOPEN_THRESHOLD = 0.25; // Ambang batas mata dianggap sudah terbuka kembali (untuk debounce)

    faceMesh.onResults((results: Results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const earL = calculateEAR(landmarks, LEFT_EYE);
        const earR = calculateEAR(landmarks, RIGHT_EYE);
        const avgEAR = (earL + earR) / 2;

        // Logika penghitung kedipan
        if (avgEAR < EAR_THRESHOLD && !isEyeClosed) {
          // Fase 1: Mata mulai tertutup
          isEyeClosed = true;
        } else if (avgEAR > REOPEN_THRESHOLD && isEyeClosed) {
          // Fase 2: Mata terbuka kembali (Kedipan Selesai)
          blinkCount++;
          isEyeClosed = false;
        }
      }
    });

    video.onloadedmetadata = async () => {
      video.play();
      
      const process = async () => {
        if (!video.paused && !video.ended) {
          await faceMesh.send({ image: video });
          requestAnimationFrame(process);
        } else {
          // Selesai memproses seluruh frame video
          console.log("Total kedipan terdeteksi:", blinkCount);
          resolve(blinkCount);
        }
      };
      process();
    };
  });
};