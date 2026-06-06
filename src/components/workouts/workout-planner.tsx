
"use client";

import { useData, Workout } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, CalendarCheck } from "lucide-react";

const DAYS = [
  { id: 1, label: "monday" },
  { id: 2, label: "tuesday" },
  { id: 3, label: "wednesday" },
  { id: 4, label: "thursday" },
  { id: 5, label: "friday" },
  { id: 6, label: "saturday" },
  { id: 0, label: "sunday" },
];

export function WorkoutPlanner({ onStartWorkout }: { onStartWorkout: (workout: Workout) => void }) {
  const { workouts, workoutPlan, updateWorkoutPlan } = useData();
  const { t } = useI18n();

  const getDayWorkout = (day: number) => {
    const workoutId = workoutPlan[day];
    return workouts.find(w => w.id === workoutId);
  };

  const today = new Date().getDay();

  return (
    <div className="space-y-4">
      {DAYS.map(({ id, label }) => {
        const workout = getDayWorkout(id);
        const isToday = today === id;

        return (
          <Card key={id} className={`border-none shadow-sm overflow-hidden ${isToday ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {(t as any)[label]}
                  </span>
                  {isToday && (
                    <span className="bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Today</span>
                  )}
                </div>
                {workout ? (
                  <h4 className="font-bold text-lg">{workout.name}</h4>
                ) : (
                  <p className="text-muted-foreground italic text-sm">{t.restDay}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {workout && (
                  <Button size="icon" className="rounded-full h-10 w-10 shadow-md bg-primary" onClick={() => onStartWorkout(workout)}>
                    <Play size={18} />
                  </Button>
                )}
                
                <Select 
                  value={workoutPlan[id] || "rest"} 
                  onValueChange={(val) => updateWorkoutPlan(id, val === "rest" ? "" : val)}
                >
                  <SelectTrigger className="w-[100px] rounded-xl text-xs h-8 border-none bg-accent/50">
                    <SelectValue placeholder={t.restDay} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="rest" className="text-xs font-bold">{t.restDay}</SelectItem>
                    {workouts.map(w => (
                      <SelectItem key={w.id} value={w.id} className="text-xs font-bold">
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
