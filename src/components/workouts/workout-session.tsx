
"use client";

import { useState, useEffect } from "react";
import { Workout, Exercise } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Timer, ExternalLink, CheckCircle, ChevronLeft, ChevronRight, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export function WorkoutSession({ workout, onFinish }: { workout: Workout, onFinish: () => void }) {
  const { t } = useI18n();
  const { toast } = useToast();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const [holdTimer, setHoldTimer] = useState(0);
  const [isHoldTimerRunning, setIsHoldTimerRunning] = useState(false);

  const exercise = workout.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + (currentSet / (exercise?.sets || 1))) / (workout.exercises.length || 1)) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && isTimerRunning && restTime > 0) {
      interval = setInterval(() => setRestTime((prev) => prev - 1), 1000);
    } else if (restTime === 0 && isResting) {
      setIsResting(false);
      setIsTimerRunning(false);
      toast({ title: "Rest Over!", description: "Next set!" });
    }
    return () => clearInterval(interval);
  }, [isResting, isTimerRunning, restTime, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHoldTimerRunning && holdTimer > 0) {
      interval = setInterval(() => setHoldTimer((prev) => prev - 1), 1000);
    } else if (holdTimer === 0 && isHoldTimerRunning) {
      setIsHoldTimerRunning(false);
      toast({ title: "Hold Complete!" });
    }
    return () => clearInterval(interval);
  }, [isHoldTimerRunning, holdTimer, toast]);

  useEffect(() => {
    if (exercise?.type === 'hold') {
      setHoldTimer(exercise.timeSeconds || 0);
      setIsHoldTimerRunning(false);
    }
  }, [currentExerciseIndex, currentSet, exercise]);

  const handleSetComplete = () => {
    if (currentSet < exercise.sets) {
      setCurrentSet(currentSet + 1);
      startRest(60);
    } else {
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      startRest(90);
    } else {
      toast({ title: "Workout Complete!" });
      onFinish();
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  const startRest = (time: number) => {
    setRestTime(time);
    setIsResting(true);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col p-6 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto">
      <header className="flex items-center justify-between mb-6 flex-shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={onFinish}>
          <X size={24} />
        </Button>
        <div className="flex flex-col items-center">
           <h2 className="text-sm font-black uppercase tracking-widest text-primary truncate max-w-[150px]">{workout.name}</h2>
           <span className="text-[10px] font-bold text-muted-foreground">{currentExerciseIndex + 1} / {workout.exercises.length}</span>
        </div>
        <div className="w-10" />
      </header>

      <Progress value={progress} className="h-1 mb-6 rounded-full flex-shrink-0" />

      {isResting ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-10 animate-in slide-in-from-bottom-8">
           <div className="space-y-2 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
                <Timer size={14} /> {t.rest}
              </span>
              <div className="text-8xl font-black leading-none tabular-nums text-primary">
                {formatTime(restTime)}
              </div>
           </div>
           
           <div className="space-y-4 w-full max-w-xs">
             <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Coming up next:</p>
                <p className="text-xl font-black">{exercise.name} (Set {currentSet})</p>
             </div>
             <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setRestTime(restTime + 30)}>+30s</Button>
                <Button className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsResting(false)}>Skip</Button>
             </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6">
           {/* Visual Guide Area */}
           <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-accent/30 shadow-inner flex-shrink-0">
              {exercise.imageUrl ? (
                <Image src={exercise.imageUrl} alt={exercise.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                  <ImageIcon size={48} strokeWidth={1} />
                  <p className="text-xs font-bold mt-2">NO VISUAL GUIDE</p>
                </div>
              )}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {exercise.videoUrl && (
                  <a href={exercise.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-black transition-all">
                    <Play size={10} className="fill-current" /> Form Video
                  </a>
                )}
              </div>
           </div>

           <div className="text-center space-y-2">
              <h3 className="text-3xl font-black leading-tight">{exercise.name}</h3>
              <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Set {currentSet} of {exercise.sets}</span>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center">
              {exercise.type === 'hold' ? (
                <div className="flex flex-col items-center">
                  <div 
                    className="text-9xl font-black leading-none tabular-nums text-primary cursor-pointer active:scale-95 transition-transform"
                    onClick={() => setIsHoldTimerRunning(!isHoldTimerRunning)}
                  >
                    {holdTimer}
                  </div>
                  <Button variant="ghost" className="text-primary font-black uppercase text-[10px] mt-2" onClick={() => setHoldTimer(exercise.timeSeconds || 0)}>Reset Timer</Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <div className="text-9xl font-black leading-none text-primary">{exercise.reps}</div>
                  <span className="text-xl font-black text-muted-foreground self-end mb-4 tracking-tighter">REPS</span>
                </div>
              )}

              {exercise.weight > 0 && (
                <div className="bg-primary/5 border border-primary/20 px-4 py-1.5 rounded-2xl text-xl font-black mt-4">
                  {exercise.weight} <span className="text-[10px] text-muted-foreground uppercase">kg</span>
                </div>
              )}
           </div>

           {/* Controls */}
           <div className="space-y-4 mt-auto">
              <Button 
                className="w-full h-20 rounded-3xl text-2xl font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                onClick={handleSetComplete}
              >
                <CheckCircle size={24} className="mr-2" />
                {currentSet === exercise.sets && currentExerciseIndex === workout.exercises.length - 1 ? t.finishWorkout : "Done"}
              </Button>

              <div className="flex gap-2">
                 <Button variant="outline" className="flex-1 h-12 rounded-xl text-xs font-bold" onClick={handlePrevExercise} disabled={currentExerciseIndex === 0}>
                   <ChevronLeft size={16} className="mr-1" /> {t.prevExercise}
                 </Button>
                 <Button variant="outline" className="flex-1 h-12 rounded-xl text-xs font-bold" onClick={handleNextExercise} disabled={currentExerciseIndex === workout.exercises.length - 1}>
                   {t.nextExercise} <ChevronRight size={16} className="ml-1" />
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
