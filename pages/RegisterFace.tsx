import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WebcamCapture } from '@/components/WebcamCapture';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function RegisterFace() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { updateUserFace } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSave = async () => {
    if (!capturedImage) return;

    setIsSaving(true);
    try {
      // TODO: Upload image to Supabase Storage
      // const { data, error } = await supabase.storage.from('faces').upload(`${user.id}/face.jpg`, blob);
      
      await updateUserFace(capturedImage);
      
      toast({
        title: 'Face registered!',
        description: 'Now let\'s record your blink pattern.',
      });
      
      navigate('/register-blink');
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: 'Could not save face data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/20">
      <Card className="w-full max-w-lg glass">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              1
            </div>
            <div className="w-16 h-1 bg-border rounded" />
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">
              2
            </div>
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            Register Your Face
          </CardTitle>
          <CardDescription>
            Position your face within the guide and capture a clear photo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WebcamCapture
            onCapture={handleCapture}
            capturedImage={capturedImage}
            onRetake={handleRetake}
          />

          {capturedImage && (
            <Button
              onClick={handleSave}
              className="w-full gradient-primary text-primary-foreground gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Blink Registration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
