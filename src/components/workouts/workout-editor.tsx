
"use client";

import { useState, useRef } from "react";
import { useData, Workout, Exercise } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Upload, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function WorkoutEditor({ workout, onCancel, onSave }: { workout: Workout, onCancel: () => void, onSave: () => void }) {
  const { saveWorkout } = useData();
  const { t } = useI18n();
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [name, setName] = useState(workout.name);
  const [exercises, setExercises] = useState<Exercise[]>(workout.exercises);

  const handleAddExercise = () => {
    const newEx: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      type: "reps",
      sets: 3,
      reps: 10,
      timeSeconds: 30,
      weight: 0,
      videoUrl: "",
      imageUrl: ""
    };
    setExercises([...exercises, newEx]);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateExercise(id, { imageUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Workout must have a name." });
      return;
    }
    saveWorkout({ ...workout, name, exercises });
    toast({ title: "Workout Saved" });
    onSave();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20">
      <header className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="rounded-xl text-pink-500" onClick={onCancel}>
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-xl font-black font-headline tracking-tighter">{workout.name ? 'EDIT WORKOUT' : t.createWorkout.toUpperCase()}</h2>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{t.workoutName}</Label>
          <Input 
            placeholder="e.g. PUSH DAY" 
            value={name || ""} 
            onChange={(e) => setName(e.target.value)}
            className="rounded-2xl h-14 text-lg font-black border-none bg-white/5 focus-visible:ring-pink-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-muted-foreground uppercase text-[10px] tracking-[0.2em]">Exercises</h3>
            <Button variant="outline" size="sm" className="rounded-xl font-black border-pink-500/30 text-pink-500 text-[10px] tracking-widest" onClick={handleAddExercise}>
              <Plus size={14} className="mr-1" /> {t.addExercise.toUpperCase()}
            </Button>
          </div>

          {exercises.map((ex) => (
            <Card key={ex.id} className="border-none shadow-sm relative overflow-hidden bg-white/5 group rounded-3xl">
               <CardContent className="p-4 space-y-4">
                 <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/5">
                       {ex.imageUrl ? (
                         <Image src={ex.imageUrl} alt="Exercise" fill className="object-cover" />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                            <ImageIcon size={24} />
                            <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">no photo</span>
                         </div>
                       )}
                       <button 
                         className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                         onClick={() => fileInputRefs.current[ex.id]?.click()}
                       >
                         <Upload size={16} className="text-white" />
                       </button>
                       <input 
                         type="file" 
                         className="hidden" 
                         accept="image/*" 
                         ref={el => { fileInputRefs.current[ex.id] = el }}
                         onChange={(e) => handleFileUpload(ex.id, e)} 
                       />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start h-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.exerciseName}</Label>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-pink-500" onClick={() => removeExercise(ex.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <Input 
                        placeholder="Exercise" 
                        value={ex.name || ""} 
                        onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                        className="rounded-xl h-10 text-sm font-bold bg-white/5 border-none focus-visible:ring-pink-500"
                      />
                    </div>
                 </div>

                 {/* Perfectly Aligned Input Grid */}
                 <div className="grid grid-cols-4 gap-3">
                   <QuickAdjustInput 
                      label={t.sets}
                      value={ex.sets}
                      onChange={(val) => updateExercise(ex.id, { sets: val })}
                   />

                   <div className="col-span-2 space-y-1.5">
                     <div className="flex justify-between items-center h-6">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                         {ex.type === 'reps' ? t.reps : t.timeSec}
                       </Label>
                       <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Hold</span>
                          <Switch 
                            checked={ex.type === 'hold'} 
                            onCheckedChange={(checked) => updateExercise(ex.id, { type: checked ? 'hold' : 'reps' })}
                            className="scale-125"
                          />
                       </div>
                     </div>
                     <div className="relative group">
                        <Input 
                          type="number" 
                          value={(ex.type === 'reps' ? ex.reps : ex.timeSeconds) || 0} 
                          onChange={(e) => updateExercise(ex.id, ex.type === 'reps' ? { reps: Number(e.target.value) } : { timeSeconds: Number(e.target.value) })}
                          className="rounded-xl h-10 text-center font-bold bg-white/5 border-none focus-visible:ring-0 pr-16 shadow-none outline-none"
                        />
                        <div className="absolute right-0.5 top-0.5 bottom-0.5 flex gap-0.5">
                          <button 
                            type="button"
                            onClick={() => {
                              const current = ex.type === 'reps' ? (ex.reps || 0) : (ex.timeSeconds || 0);
                              const newVal = Math.max(0, current - 1);
                              updateExercise(ex.id, ex.type === 'reps' ? { reps: newVal } : { timeSeconds: newVal });
                            }}
                            className="w-7 h-full flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-pink-500 transition-all active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              const current = ex.type === 'reps' ? (ex.reps || 0) : (ex.timeSeconds || 0);
                              const newVal = current + 1;
                              updateExercise(ex.id, ex.type === 'reps' ? { reps: newVal } : { timeSeconds: newVal });
                            }}
                            className="w-7 h-full flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-pink-500 transition-all active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                     </div>
                   </div>

                   <QuickAdjustInput 
                      label="kg"
                      value={ex.weight}
                      onChange={(val) => updateExercise(ex.id, { weight: val })}
                   />
                 </div>

                 <div className="space-y-1.5 pt-1">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{t.imageLink}</Label>
                    <Input 
                      placeholder="https://..." 
                      value={ex.imageUrl || ""} 
                      onChange={(e) => updateExercise(ex.id, { imageUrl: e.target.value })}
                      className="rounded-xl h-10 text-[10px] font-bold bg-white/5 border-none focus-visible:ring-pink-500"
                    />
                 </div>
               </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          className="w-full h-16 rounded-[2rem] text-lg font-black bg-pink-500 hover:bg-pink-600 shadow-xl shadow-pink-500/20" 
          onClick={handleSave}
        >
          {t.save.toUpperCase()}
        </Button>
      </div>
    </div>
  );
}

function QuickAdjustInput({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="h-6 flex items-center">
        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</Label>
      </div>
      <div className="relative group">
        <Input 
          type="number" 
          value={value || 0} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded-xl h-10 pr-14 bg-white/5 border-none font-bold text-center focus-visible:ring-0 shadow-none outline-none"
        />
        <div className="absolute right-0.5 top-0.5 bottom-0.5 flex gap-0.5">
          <button 
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="w-6 h-full flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-pink-500 transition-all active:scale-90"
          >
            <Minus size={12} />
          </button>
          <button 
            type="button"
            onClick={() => onChange(value + 1)}
            className="w-6 h-full flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-pink-500 transition-all active:scale-90"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
