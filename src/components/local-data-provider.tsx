
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

type DataContextType = {
  profile: UserProfile;
  logs: FoodLog[];
  waterLogs: WaterLog[];
  updateProfile: (profile: UserProfile) => void;
  addLog: (log: Omit<FoodLog, 'id'>) => void;
  removeLog: (id: string) => void;
  addWater: (amount: number) => void;
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
  theme: 'black'
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function LocalDataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedProfile = localStorage.getItem("nutrinexus_profile");
    const storedLogs = localStorage.getItem("nutrinexus_logs");
    const storedWater = localStorage.getItem("nutrinexus_water_logs");

    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setProfile({ ...defaultProfile, ...parsed });
    }
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    if (storedWater) setWaterLogs(JSON.parse(storedWater));
    
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

  return (
    <DataContext.Provider value={{ 
      profile, logs, waterLogs,
      updateProfile, addLog, removeLog, addWater,
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
