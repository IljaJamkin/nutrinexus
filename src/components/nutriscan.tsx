
"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle, Loader2, Barcode, ImagePlus, Keyboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { estimateFoodMacrosFromPhoto } from "@/ai/flows/estimate-food-macros-from-photo";
import { useData } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ScanStep = "selection" | "camera" | "barcode" | "upload" | "manual" | "scanning" | "result";

export function NutriScan({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<ScanStep>("selection");
  const [photo, setPhoto] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [estimation, setEstimation] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addLog } = useData();
  const { t } = useI18n();
  const { toast } = useToast();

  const startCamera = async (mode: "camera" | "barcode") => {
    setStep(mode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Camera Error", description: "Could not access camera." });
      setStep("selection");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      // Set canvas to a reasonable size to avoid massive base64 strings
      const maxWidth = 1024;
      const scale = maxWidth / videoRef.current.videoWidth;
      canvasRef.current.width = videoRef.current.videoWidth * Math.min(1, scale);
      canvasRef.current.height = videoRef.current.videoHeight * Math.min(1, scale);
      
      context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const dataUri = canvasRef.current.toDataURL("image/jpeg", 0.8);
      setPhoto(dataUri);
      
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setStep("scanning");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
        setStep("scanning");
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const runScanning = async () => {
      if (step === "scanning" && !estimation) {
        try {
          const result = await estimateFoodMacrosFromPhoto({ 
            photoDataUri: photo || undefined,
            description: manualText || undefined
          });
          setEstimation(result);
          setStep("result");
        } catch (error: any) {
          console.error("Scanning Error:", error);
          toast({ 
            variant: "destructive", 
            title: "AI Analysis Error", 
            description: error.message || "Failed to estimate nutrition. Please try again." 
          });
          setStep("selection");
          setPhoto(null);
          setManualText("");
        }
      }
    };

    runScanning();
  }, [step, estimation, photo, manualText, toast]);

  const handleSave = () => {
    if (!estimation) return;
    
    addLog({
      foodName: estimation.foodDescription,
      calories: estimation.calories,
      protein: estimation.protein,
      carbs: estimation.carbohydrates,
      fats: estimation.fats,
      timestamp: new Date().toISOString(),
      image: photo
    });

    toast({ title: "Success", description: "Food logged successfully!" });
    onSuccess();
  };

  const reset = () => {
    setStep("selection");
    setPhoto(null);
    setEstimation(null);
    setManualText("");
  };

  return (
    <div className="h-full flex flex-col space-y-6 py-4 max-w-md mx-auto w-full">
      {step === "selection" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold font-headline text-primary">{t.nutriScan}</h1>
            <p className="text-muted-foreground font-medium">{t.logMethod}</p>
          </header>

          <div className="grid grid-cols-2 gap-4">
            <SelectionCard 
              icon={<Camera size={32} />} 
              label={t.camera} 
              onClick={() => startCamera("camera")} 
            />
            <SelectionCard 
              icon={<Barcode size={32} />} 
              label={t.barcode} 
              onClick={() => startCamera("barcode")} 
            />
            <SelectionCard 
              icon={<ImagePlus size={32} />} 
              label={t.uploadImage} 
              onClick={() => fileInputRef.current?.click()} 
            />
            <SelectionCard 
              icon={<Keyboard size={32} />} 
              label={t.manualEntry} 
              onClick={() => setStep("manual")} 
            />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload} 
          />
        </div>
      )}

      {(step === "camera" || step === "barcode") && (
        <div className="w-full h-[500px] relative bg-black rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
          <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
          
          {step === "barcode" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-white/50 rounded-xl relative">
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary" />
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary" />
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary" />
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary" />
                 <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/50 animate-pulse" />
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <Button variant="secondary" size="icon" className="rounded-full bg-white/20 backdrop-blur-md border-none text-white" onClick={reset}>
              <ArrowLeft size={20} />
            </Button>
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <button 
              onClick={capturePhoto} 
              className="w-20 h-20 bg-white rounded-full border-8 border-white/30 flex items-center justify-center transition-transform active:scale-90"
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {step === "manual" && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <header className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={reset}>
              <ArrowLeft size={20} />
            </Button>
            <h2 className="text-xl font-bold font-headline">{t.manualEntry}</h2>
          </header>
          
          <div className="space-y-4">
            <Textarea 
              placeholder={t.enterDescription} 
              className="min-h-[200px] rounded-2xl p-4 text-lg border-2 focus-visible:ring-primary"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
            />
            <Button 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
              onClick={() => setStep("scanning")}
              disabled={!manualText.trim()}
            >
              {t.analyze}
            </Button>
          </div>
        </div>
      )}

      {step === "scanning" && (
        <div className="w-full h-[500px] flex flex-col items-center justify-center space-y-6">
          <div className="relative w-48 h-48">
            <Loader2 className="w-full h-full text-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
               {photo ? (
                 <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image src={photo} alt="Preview" fill className="object-cover" />
                 </div>
               ) : (
                 <Keyboard size={40} className="text-primary" />
               )}
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold font-headline text-primary">Analyzing...</h2>
            <p className="text-muted-foreground font-medium">NutriNexus is calculating macros</p>
          </div>
        </div>
      )}

      {step === "result" && estimation && (
        <div className="w-full space-y-6 animate-in zoom-in-95 duration-300 pb-20">
          {photo && (
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <Image src={photo} alt="Food" fill className="object-cover" />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                 <div className="flex justify-between items-center">
                   <p className="font-bold text-lg">{estimation.foodDescription}</p>
                   <span className={cn(
                     "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold",
                     estimation.confidence === 'High' ? 'bg-green-500' : estimation.confidence === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                   )}>{t.confidence}: {estimation.confidence}</span>
                 </div>
              </div>
            </div>
          )}

          {!photo && (
            <div className="bg-card p-6 rounded-3xl shadow-sm border-2 border-primary/10">
               <h3 className="font-bold text-xl text-primary mb-2">{estimation.foodDescription}</h3>
               <span className={cn(
                 "px-2 py-1 rounded-full text-[10px] uppercase font-bold text-white",
                 estimation.confidence === 'High' ? 'bg-green-500' : estimation.confidence === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
               )}>{t.confidence}: {estimation.confidence}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <ResultCard label={t.calories} value={`${estimation.calories} kcal`} color="text-primary" />
            <ResultCard label={t.protein} value={`${estimation.protein}g`} color="text-orange-500" />
            <ResultCard label={t.carbs} value={`${estimation.carbohydrates}g`} color="text-sky-500" />
            <ResultCard label={t.fats} value={`${estimation.fats}g`} color="text-emerald-500" />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 font-bold" onClick={reset}>
              <RefreshCw className="mr-2" size={20} /> Retake
            </Button>
            <Button className="flex-1 rounded-2xl h-14 font-bold shadow-lg shadow-primary/20" onClick={handleSave}>
              <CheckCircle className="mr-2" size={20} /> {t.addLog}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectionCard({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-card rounded-3xl shadow-sm border border-border hover:border-primary hover:bg-primary/5 transition-all group active:scale-95 h-36"
    >
      <div className="text-muted-foreground group-hover:text-primary transition-colors mb-3">
        {icon}
      </div>
      <span className="font-bold text-sm text-foreground">{label}</span>
    </button>
  );
}

function ResultCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col items-center justify-center text-center">
      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{label}</span>
      <span className={cn("text-xl font-black", color)}>{value}</span>
    </div>
  );
}
