
"use client";

import { useState } from "react";
import { useData, Workout, WorkoutCycle } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { DashboardView } from "./dashboard-view";
import { ScheduleView } from "./schedule-view";
import { WorkoutEditor } from "./workout-editor";
import { WorkoutSession } from "./workout-session";

export type WorkoutView = "dashboard" | "schedule" | "editor" | "session";

export function Workouts() {
  const { saveCycle } = useData();
  const { t } = useI18n();
  
  const [view, setView] = useState<WorkoutView>("dashboard");
  const [activeCycle, setActiveCycle] = useState<WorkoutCycle | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [sessionWorkout, setSessionWorkout] = useState<Workout | null>(null);

  const handleCreateWorkout = () => {
    setEditingWorkout({
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      exercises: []
    });
    setView("editor");
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setView("editor");
  };

  const handleStartWorkout = (workout: Workout) => {
    setSessionWorkout(workout);
    setView("session");
  };

  const handleManageSchedule = (cycle: WorkoutCycle) => {
    setActiveCycle(cycle);
    setView("schedule");
  };

  const handleCreateCycle = () => {
    const newCycle: WorkoutCycle = {
      id: Math.random().toString(36).substr(2, 9),
      name: "NEW CYCLE",
      createdAt: new Date().toISOString(),
      plan: {}
    };
    saveCycle(newCycle);
    setActiveCycle(newCycle);
    setView("schedule");
  };

  return (
    <div className="min-h-full">
      {view === "dashboard" && (
        <DashboardView 
          onManageSchedule={handleManageSchedule}
          onStartWorkout={handleStartWorkout}
          onCreateCycle={handleCreateCycle}
        />
      )}
      
      {view === "schedule" && (
        <ScheduleView 
          cycle={activeCycle!} 
          onBack={() => setView("dashboard")}
          onEditWorkout={handleEditWorkout}
          onCreateWorkout={handleCreateWorkout}
        />
      )}

      {view === "editor" && editingWorkout && (
        <WorkoutEditor 
          workout={editingWorkout} 
          onCancel={() => setView("schedule")} 
          onSave={() => setView("schedule")} 
        />
      )}

      {view === "session" && sessionWorkout && (
        <WorkoutSession 
          workout={sessionWorkout} 
          onFinish={() => setView("dashboard")} 
        />
      )}
    </div>
  );
}
