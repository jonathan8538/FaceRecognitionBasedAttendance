import { useEffect, useState } from 'react';
import { Video, Square, RefreshCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebcam } from '@/hooks/useWebcam';
import { cn } from '@/lib/utils';

interface BlinkRecorderProps {
  onRecord: (videoBlob: Blob) => void;
  recordedVideo: Blob | null;
  onRetake: () => void;
}

export function BlinkRecorder({ onRecord, recordedVideo, onRetake }: BlinkRecorderProps) {
  const {
    videoRef,
    isStreaming,
    isRecording,
    startStream,
    stopStream,
    startRecording,
    stopRecording,
  } = useWebcam();
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!recordedVideo) {
      startStream();
    }
    return () => {
      stopStream();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [recordedVideo, startStream, stopStream, videoUrl]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 5) {
            handleStopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          startRecording();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    stopRecording();
    setRecordingTime(0);
    
    // Get the recorded blob from the mediaRecorder
    setTimeout(() => {
      const chunks: Blob[] = [];
      // Access recorded data - this would come from the hook
      // For now, create a mock blob for demo
      const mockBlob = new Blob([], { type: 'video/webm' });
      if (mockBlob.size > 0) {
        const url = URL.createObjectURL(mockBlob);
        setVideoUrl(url);
        onRecord(mockBlob);
      }
    }, 100);
  };

  const handleRetake = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    onRetake();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden bg-muted border-2 border-border">
        {recordedVideo && videoUrl ? (
          <video
            src={videoUrl}
            controls
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

        {/* Countdown overlay */}
        {countdown && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-6xl font-bold text-primary animate-pulse">
              {countdown}
            </span>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <span className="text-sm font-medium">REC {recordingTime}s / 5s</span>
          </div>
        )}

        {!isStreaming && !recordedVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Loading camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 px-4 py-2 rounded-lg">
        <Eye className="w-4 h-4" />
        <span>Blink twice (double blink) during recording</span>
      </div>

      <div className="flex gap-3">
        {recordedVideo ? (
          <Button variant="outline" onClick={handleRetake} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Record Again
          </Button>
        ) : isRecording ? (
          <Button
            onClick={handleStopRecording}
            variant="destructive"
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </Button>
        ) : (
          <Button
            onClick={handleStartRecording}
            disabled={!isStreaming || countdown !== null}
            className="gap-2 gradient-primary text-primary-foreground"
          >
            <Video className="w-4 h-4" />
            Start Recording
          </Button>
        )}
      </div>
    </div>
  );
}
