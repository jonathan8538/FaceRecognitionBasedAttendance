import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { WebcamCapture } from "@/components/WebcamCapture";
import { useAuthContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterFace() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCapture = (imageBase64: string) => {
    setCapturedImage(imageBase64);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSave = async () => {
    if (!capturedImage || !user) return;

    setIsSaving(true);

    try {
      // 1️⃣ Kirim foto ke backend DeepFace
      const res = await fetch("http://localhost:8000/face/embedding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: capturedImage, // base64 data:image/jpeg;base64,...
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.detail ?? "Failed to extract embedding");
      }

      const { embedding, model, dimensions } = await res.json();

      if (!Array.isArray(embedding)) {
        throw new Error("Invalid embedding returned from server");
      }

      // 2️⃣ Simpan embedding ke Supabase
      const { error } = await supabase
        .from("user_face_embeddings")
        .insert({
          user_id: user.id,
          embedding, // float[] (512D ArcFace)
          model,
          dimensions,
        });

      if (error) throw error;

      toast({
        title: "Face registered!",
        description: "Proceed to blink registration.",
      });

      navigate("/register-blink");
    } catch (err: any) {
      console.error("RegisterFace error:", err);
      toast({
        title: "Failed to register face",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
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
            Make sure your face is clearly visible and well-lit
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
                  Processing...
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
