
"use client";

import { useData, Workout, WorkoutCycle } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Edit2, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

const DAYS = [
  { id: 0, label: "SUNDAY" },
  { id: 1, label: "MONDAY" },
  { id: 2, label: "TUESDAY" },
  { id: 3, label: "WEDNESDAY" },
  { id: 4, label: "THURSDAY" },
  { id: 5, label: "FRIDAY" },
  { id: 6, label: "SATURDAY" },
];

export function ScheduleView({ 
  cycle, 
  onBack, 
  onEditWorkout,
  onCreateWorkout 
}: { 
  cycle: WorkoutCycle, 
  onBack: () => void,
  onEditWorkout: (workout: Workout) => void,
  onCreateWorkout: () => void
}) {
  const { t } = useI18n();
  const { workouts, workoutPlan, updateWorkoutPlan, deleteWorkout, saveCycle, deleteCycle } = useData();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [targetDay, setTargetDay] = useState<number | null>(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [cycleName, setCycleName] = useState(cycle.name);

  useEffect(() => {
    setCycleName(cycle.name);
  }, [cycle]);

  const getDayWorkout = (day: number) => {
    const workoutId = workoutPlan[day];
    return workouts.find(w => w.id === workoutId);
  };

  const handleAssign = (day: number) => {
    setTargetDay(day);
    setIsPickerOpen(true);
  };

  const pickWorkout = (workoutId: string) => {
    if (targetDay !== null) {
      updateWorkoutPlan(targetDay, workoutId);
      setIsPickerOpen(false);
    }
  };

  const handleSaveName = () => {
    saveCycle({ ...cycle, name: cycleName });
    setIsEditingName(false);
  };

  const handleDeleteCycle = () => {
    deleteCycle(cycle.id);
    onBack();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-pink-500" onClick={onBack}>
          <ArrowLeft size={24} />
        </Button>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input 
                value={cycleName} 
                onChange={(e) => setCycleName(e.target.value)}
                className="bg-white/5 border-pink-500/50 text-xl font-black font-headline h-9 rounded-lg focus-visible:ring-pink-500"
                autoFocus
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-pink-500" onClick={handleSaveName}>
                <Check size={18} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              <h1 className="text-2xl font-black font-headline tracking-tighter leading-none truncate">{cycle.name}</h1>
              <Edit2 size={14} className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t.manageSchedule}</p>
        </div>
        <button 
          type="button"
          className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-white/5 transition-all" 
          onClick={handleDeleteCycle}
        >
          <Trash2 size={22} />
        </button>
      </header>

      <div className="space-y-8">
        {DAYS.map((day) => {
          const workout = getDayWorkout(day.id);
          return (
            <div key={day.id} className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black tracking-[0.2em] text-foreground/60">{day.label}</h3>
                <button 
                  onClick={() => handleAssign(day.id)}
                  className="text-[10px] font-black text-pink-500 hover:text-pink-400 flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} /> {t.assignPlan}
                </button>
              </div>

              {workout ? (
                <Card className="bg-[#2a2627] border-none rounded-3xl overflow-hidden shadow-lg p-4 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-pink-500 flex-shrink-0 relative overflow-hidden">
                         {workout.exercises[0]?.imageUrl ? (
                           <Image src={workout.exercises[0].imageUrl} alt="First exercise" fill className="object-cover" />
                         ) : (
                           <span className="font-black text-lg">{workout.name[0]}</span>
                         )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{workout.name}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{workout.exercises.length} Exercises</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-pink-500 hover:bg-white/5 transition-all" 
                        onClick={() => onEditWorkout(workout)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        type="button"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-white/5 transition-all" 
                        onClick={() => deleteWorkout(workout.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="border-2 border-dashed border-white/5 bg-transparent rounded-3xl p-6 flex items-center justify-center">
                  <span className="text-xs italic font-bold text-muted-foreground/30">{t.restDay}</span>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Workout Picker Modal */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="bg-[#1e1b1c] border-white/10 rounded-[2rem] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-center">{t.assignPlan}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 mt-4 max-h-[400px] overflow-y-auto pr-2">
             <Button 
               variant="outline" 
               className="h-14 rounded-2xl border-pink-500/30 text-pink-500 font-black"
               onClick={onCreateWorkout}
             >
               <Plus size={18} className="mr-2" /> {t.createWorkout}
             </Button>
             <div className="h-px bg-white/5 my-2" />
             {workouts.length === 0 ? (
               <p className="text-center text-xs text-muted-foreground italic py-4">No workouts created yet.</p>
             ) : (
               workouts.map(w => (
                 <button
                   key={w.id}
                   onClick={() => pickWorkout(w.id)}
                   className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-left"
                 >
                   <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center font-black">
                     {w.name[0]}
                   </div>
                   <div>
                     <p className="font-bold text-sm">{w.name}</p>
                     <p className="text-[10px] text-muted-foreground">{w.exercises.length} Exercises</p>
                   </div>
                 </button>
               ))
             )}
             <Button variant="ghost" className="h-12 rounded-2xl font-bold text-muted-foreground" onClick={() => pickWorkout("")}>
               Clear / Set as Rest Day
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
