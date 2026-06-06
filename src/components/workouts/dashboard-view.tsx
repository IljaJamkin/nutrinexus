"use client";

import { useMemo, useState, useEffect } from "react";
import { useData, Workout, WorkoutCycle } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, Play, Calendar as CalendarIcon, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function DashboardView({ 
  onManageSchedule, 
  onStartWorkout, 
  onCreateCycle 
}: { 
  onManageSchedule: (cycle: WorkoutCycle) => void,
  onStartWorkout: (workout: Workout) => void,
  onCreateCycle: () => void
}) {
  const { t } = useI18n();
  const { workouts, workoutPlan, cycles, deleteCycle } = useData();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSelectedDate(new Date());
    setMounted(true);
  }, []);

  const calendarData = useMemo(() => {
    if (!mounted) return { monthYear: "", daysInMonth: 0, startDay: 0, todayDay: 0 };
    const today = new Date();
    return {
      monthYear: today.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase(),
      daysInMonth: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(),
      startDay: new Date(today.getFullYear(), today.getMonth(), 1).getDay(),
      todayDay: today.getDate()
    };
  }, [mounted]);

  const activeWorkout = useMemo(() => {
    if (!selectedDate) return null;
    const workoutId = workoutPlan[selectedDate.getDay()];
    return workouts.find(w => w.id === workoutId);
  }, [selectedDate, workoutPlan, workouts]);

  if (!mounted || !selectedDate) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-black font-headline tracking-tight">{t.workoutWeeks}</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-pink-500 text-white hover:bg-pink-600 h-8 w-8"
          onClick={onCreateCycle}
        >
          <Plus size={20} />
        </Button>
      </header>

      {/* Calendar Grid Card */}
      <Card className="bg-[#2a2627] border-none rounded-[2rem] shadow-2xl overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-black tracking-widest text-muted-foreground">{calendarData.monthYear}</span>
        </div>
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <span key={i} className="text-[10px] font-black text-muted-foreground">{d}</span>
          ))}
          {Array.from({ length: calendarData.startDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === calendarData.todayDay;
            return (
              <div key={day} className="flex items-center justify-center">
                <button 
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                    isToday ? "bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]" : "text-foreground/80 hover:bg-white/5"
                  )}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Daily Info Card */}
      {activeWorkout ? (
        <Card className="bg-[#2a2627] border-none rounded-[2rem] overflow-hidden shadow-xl p-6">
          <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-xl font-black">{activeWorkout.name}</h3>
                <p className="text-xs font-bold text-muted-foreground">{activeWorkout.exercises.length} Exercises</p>
             </div>
             <Button 
               size="icon" 
               className="rounded-full bg-pink-500 text-white h-10 w-10 shadow-lg shadow-pink-500/20"
               onClick={() => onStartWorkout(activeWorkout)}
             >
               <Play size={20} fill="currentColor" />
             </Button>
          </div>
          <div className="grid gap-3">
             {activeWorkout.exercises.slice(0, 3).map(ex => (
               <div key={ex.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                    {ex.imageUrl && <Image src={ex.imageUrl} alt={ex.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{ex.name}</p>
                    <p className="text-[10px] text-muted-foreground">{ex.sets} Sets • {ex.type === 'reps' ? `${ex.reps} Reps` : `${ex.timeSeconds}s`}</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-white/10 bg-transparent rounded-[2rem] p-10 flex flex-col items-center justify-center text-center space-y-3">
           <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-pink-500 mb-2">
              <Sparkles size={24} />
           </div>
           <h3 className="text-xs font-black tracking-[0.2em] text-foreground/50">{t.noWorkoutScheduled}</h3>
           <p className="text-sm italic font-medium text-muted-foreground/40">{t.restDay}</p>
        </Card>
      )}

      {/* Cycles Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-black tracking-widest text-muted-foreground uppercase">{t.allCycles}</h2>
        <div className="grid gap-3">
          {cycles.map(cycle => (
            <div key={cycle.id} className="relative bg-[#2a2627] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button 
                onClick={() => onManageSchedule(cycle)}
                className="w-full flex items-center gap-4 p-5 pr-24 text-left active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-pink-500">
                  <CalendarIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm truncate">{cycle.name}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{t.created} {new Date(cycle.createdAt).toLocaleDateString().toUpperCase()}</p>
                </div>
              </button>
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                <button 
                  type="button"
                  className="h-10 w-10 rounded-xl bg-white/10 text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-all flex items-center justify-center pointer-events-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteCycle(cycle.id);
                  }}
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight size={18} className="text-muted-foreground pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}