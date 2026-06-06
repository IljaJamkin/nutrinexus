
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType = 'white' | 'black' | 'purple';

export type UserProfile = {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWater: number;
  theme: ThemeType;
};

export type FoodLog = {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
  image: string | null;
};

export type WaterLog = {
  id: string;
  amount: number;
  timestamp: string;
};

export type ExerciseType = 'reps' | 'hold';

export type Exercise = {
  id: string;
  name: string;
  type: ExerciseType;
  sets: number;
  reps?: number;
  timeSeconds?: number;
  weight: number;
  videoUrl?: string;
  imageUrl?: string;
};

export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
};

export type WorkoutPlan = {
  [day: number]: string; // day (0-6) mapping to workoutId
};

export type WorkoutCycle = {
  id: string;
  name: string;
  createdAt: string;
  plan: WorkoutPlan;
};

export type SkillProgressionLevel = 'assisted' | 'negative' | 'full';

export type SkillProgression = {
  id: string;
  name: string;
  level: SkillProgressionLevel;
  bestHoldTime: number;
  bestReps: number;
};

type DataContextType = {
  profile: UserProfile;
  logs: FoodLog[];
  waterLogs: WaterLog[];
  workouts: Workout[];
  workoutPlan: WorkoutPlan;
  cycles: WorkoutCycle[];
  skillProgressions: SkillProgression[];
  updateProfile: (profile: UserProfile) => void;
  addLog: (log: Omit<FoodLog, 'id'>) => void;
  removeLog: (id: string) => void;
  addWater: (amount: number) => void;
  saveWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  updateWorkoutPlan: (day: number, workoutId: string) => void;
  saveCycle: (cycle: WorkoutCycle) => void;
  deleteCycle: (id: string) => void;
  saveSkillProgression: (skill: SkillProgression) => void;
  deleteSkillProgression: (id: string) => void;
  loading: boolean;
};

const defaultProfile: UserProfile = {
  weight: 70,
  height: 175,
  age: 25,
  gender: 'male',
  activityLevel: 1.2,
  targetCalories: 2000,
  targetProtein: 150,
  targetCarbs: 200,
  targetFats: 70,
  targetWater: 2000,
  theme: 'black' // Standardizing on the high fidelity dark theme
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function LocalDataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>({});
  const [cycles, setCycles] = useState<WorkoutCycle[]>([]);
  const [skillProgressions, setSkillProgressions] = useState<SkillProgression[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedProfile = localStorage.getItem("nutrinexus_profile");
    const storedLogs = localStorage.getItem("nutrinexus_logs");
    const storedWater = localStorage.getItem("nutrinexus_water_logs");
    const storedWorkouts = localStorage.getItem("nutrinexus_workouts");
    const storedPlan = localStorage.getItem("nutrinexus_workout_plan");
    const storedCycles = localStorage.getItem("nutrinexus_cycles");
    const storedSkills = localStorage.getItem("nutrinexus_skills");

    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setProfile({ ...defaultProfile, ...parsed });
    }
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    if (storedWater) setWaterLogs(JSON.parse(storedWater));
    if (storedWorkouts) setWorkouts(JSON.parse(storedWorkouts));
    if (storedPlan) setWorkoutPlan(JSON.parse(storedPlan));
    if (storedCycles) setCycles(JSON.parse(storedCycles));
    else {
      // Create initial main cycle
      const initialCycle: WorkoutCycle = {
        id: 'main-cycle',
        name: 'MAIN',
        createdAt: new Date().toISOString(),
        plan: JSON.parse(storedPlan || '{}')
      };
      setCycles([initialCycle]);
    }
    if (storedSkills) setSkillProgressions(JSON.parse(storedSkills));
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      document.body.classList.remove('theme-black', 'theme-purple', 'theme-white');
      if (profile.theme !== 'white') {
        document.body.classList.add(`theme-${profile.theme}`);
      }
    }
  }, [profile.theme, loading]);

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("nutrinexus_profile", JSON.stringify(newProfile));
  };

  const addLog = (newLog: Omit<FoodLog, 'id'>) => {
    const logWithId = { ...newLog, id: Math.random().toString(36).substr(2, 9) };
    const updatedLogs = [logWithId, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem("nutrinexus_logs", JSON.stringify(updatedLogs));
  };

  const removeLog = (id: string) => {
    const updatedLogs = logs.filter(log => log.id !== id);
    setLogs(updatedLogs);
    localStorage.setItem("nutrinexus_logs", JSON.stringify(updatedLogs));
  };

  const addWater = (amount: number) => {
    const newWaterLog: WaterLog = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      timestamp: new Date().toISOString()
    };
    const updatedWater = [newWaterLog, ...waterLogs];
    setWaterLogs(updatedWater);
    localStorage.setItem("nutrinexus_water_logs", JSON.stringify(updatedWater));
  };

  const saveWorkout = (workout: Workout) => {
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    let updatedWorkouts;
    if (existingIndex >= 0) {
      updatedWorkouts = [...workouts];
      updatedWorkouts[existingIndex] = workout;
    } else {
      updatedWorkouts = [workout, ...workouts];
    }
    setWorkouts(updatedWorkouts);
    localStorage.setItem("nutrinexus_workouts", JSON.stringify(updatedWorkouts));
  };

  const deleteWorkout = (id: string) => {
    const updatedWorkouts = workouts.filter(w => w.id !== id);
    setWorkouts(updatedWorkouts);
    localStorage.setItem("nutrinexus_workouts", JSON.stringify(updatedWorkouts));
  };

  const updateWorkoutPlan = (day: number, workoutId: string) => {
    const updatedPlan = { ...workoutPlan, [day]: workoutId };
    if (!workoutId) delete updatedPlan[day];
    setWorkoutPlan(updatedPlan);
    localStorage.setItem("nutrinexus_workout_plan", JSON.stringify(updatedPlan));
    
    // Sync to main cycle
    const updatedCycles = cycles.map(c => c.id === 'main-cycle' ? { ...c, plan: updatedPlan } : c);
    setCycles(updatedCycles);
    localStorage.setItem("nutrinexus_cycles", JSON.stringify(updatedCycles));
  };

  const saveCycle = (cycle: WorkoutCycle) => {
    const existingIndex = cycles.findIndex(c => c.id === cycle.id);
    let updatedCycles;
    if (existingIndex >= 0) {
      updatedCycles = [...cycles];
      updatedCycles[existingIndex] = cycle;
    } else {
      updatedCycles = [cycle, ...cycles];
    }
    setCycles(updatedCycles);
    localStorage.setItem("nutrinexus_cycles", JSON.stringify(updatedCycles));
  };

  const deleteCycle = (id: string) => {
    const updatedCycles = cycles.filter(c => c.id !== id);
    setCycles(updatedCycles);
    localStorage.setItem("nutrinexus_cycles", JSON.stringify(updatedCycles));
  };

  const saveSkillProgression = (skill: SkillProgression) => {
    const existingIndex = skillProgressions.findIndex(s => s.id === skill.id);
    let updatedSkills;
    if (existingIndex >= 0) {
      updatedSkills = [...skillProgressions];
      updatedSkills[existingIndex] = skill;
    } else {
      updatedSkills = [skill, ...skillProgressions];
    }
    setSkillProgressions(updatedSkills);
    localStorage.setItem("nutrinexus_skills", JSON.stringify(updatedSkills));
  };

  const deleteSkillProgression = (id: string) => {
    const updatedSkills = skillProgressions.filter(s => s.id !== id);
    setSkillProgressions(updatedSkills);
    localStorage.setItem("nutrinexus_skills", JSON.stringify(updatedSkills));
  };

  return (
    <DataContext.Provider value={{ 
      profile, logs, waterLogs, workouts, workoutPlan, cycles, skillProgressions,
      updateProfile, addLog, removeLog, addWater,
      saveWorkout, deleteWorkout, updateWorkoutPlan,
      saveCycle, deleteCycle,
      saveSkillProgression, deleteSkillProgression,
      loading 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within LocalDataProvider");
  return context;
}
