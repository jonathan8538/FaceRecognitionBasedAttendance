import { useEffect } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebcam } from '@/hooks/useWebcam';
import { cn } from '@/lib/utils';

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage: string | null;
  onRetake: () => void;
}

export function WebcamCapture({ onCapture, capturedImage, onRetake }: WebcamCaptureProps) {
  const { videoRef, isStreaming, startStream, stopStream, capturePhoto } = useWebcam();

  useEffect(() => {
    if (!capturedImage) {
      startStream();
    }
    return () => stopStream();
  }, [capturedImage, startStream, stopStream]);

  const handleCapture = () => {
    const image = capturePhoto();
    if (image) {
      onCapture(image);
      stopStream();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden bg-muted border-2 border-border">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured face"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover scale-x-[-1]",
              !isStreaming && "opacity-0"
            )}
          />
        )}
        
        {!isStreaming && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Loading camera...</p>
            </div>
          </div>
        )}

        {/* Face guide overlay */}
        {isStreaming && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-60 border-2 border-dashed border-primary/50 rounded-[50%]" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {capturedImage ? (
          <Button variant="outline" onClick={onRetake} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retake Photo
          </Button>
        ) : (
          <Button
            onClick={handleCapture}
            disabled={!isStreaming}
            className="gap-2 gradient-primary text-primary-foreground"
          >
            <Camera className="w-4 h-4" />
            Capture Photo
          </Button>
        )}
      </div>
    </div>
  );
}
