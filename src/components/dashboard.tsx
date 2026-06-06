"use client";

import { useMemo, useState, useEffect } from "react";
import { useData } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { profile, logs, waterLogs, addWater, loading } = useData();
  const { t } = useI18n();
  const [customWater, setCustomWater] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayTotals = useMemo(() => {
    if (!mounted) return { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todayLogs = logs.filter(log => new Date(log.timestamp) >= startOfDay);
    const todayWaterLogs = waterLogs.filter(log => new Date(log.timestamp) >= startOfDay);

    const nutrition = todayLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const water = todayWaterLogs.reduce((acc, log) => acc + log.amount, 0);

    return { ...nutrition, water };
  }, [logs, waterLogs, mounted]);

  if (loading || !mounted) return null;

  const macroProgress = (current: number, target: number) => {
    return Math.round((current / (target || 1)) * 100);
  };

  const caloriesPercentage = macroProgress(todayTotals.calories, profile.targetCalories);
  const waterPercentage = macroProgress(todayTotals.water, profile.targetWater);

  const handleCustomWaterAdd = () => {
    const amount = parseInt(customWater);
    if (!isNaN(amount) && amount !== 0) {
      addWater(amount);
      setCustomWater("");
    }
  };

  const calDiff = profile.targetCalories - Math.round(todayTotals.calories);
  const calIsOver = calDiff < 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold font-headline text-primary">{t.welcome}</h1>
        <p className="text-muted-foreground text-sm font-medium">Track your progress for today</p>
      </header>

      {/* Calories Card */}
      <Card className="border-none shadow-md overflow-hidden bg-primary text-primary-foreground transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">{t.calories}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end space-x-2">
            <span className="text-5xl font-extrabold">{Math.round(todayTotals.calories)}</span>
            <span className="text-lg font-semibold mb-1">/ {profile.targetCalories} kcal</span>
          </div>
          <div className="space-y-2">
             <div className="macro-bar-container bg-primary-foreground/20">
                <div 
                  className="macro-bar-fill bg-primary-foreground" 
                  style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
                />
             </div>
             <p className="text-xs text-right font-bold tracking-wider">
               {calIsOver ? t.overeaten : t.remaining}: {Math.abs(calDiff)} kcal ({caloriesPercentage}%)
             </p>
          </div>
        </CardContent>
      </Card>

      {/* Macro Items */}
      <div className="grid grid-cols-1 gap-4">
        <MacroItem 
          label={t.protein} 
          current={todayTotals.protein} 
          target={profile.targetProtein} 
          unit="g" 
          color="bg-orange-500" 
        />
        <MacroItem 
          label={t.carbs} 
          current={todayTotals.carbs} 
          target={profile.targetCarbs} 
          unit="g" 
          color="bg-sky-500" 
        />
        <MacroItem 
          label={t.fats} 
          current={todayTotals.fats} 
          target={profile.targetFats} 
          unit="g" 
          color="bg-emerald-500" 
        />
      </div>

      {/* Water Tracking Card */}
      <Card className="border-none shadow-md overflow-hidden bg-sky-600 text-white rounded-[2rem]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            <div className="flex items-center">
              <Droplets className="mr-2 h-5 w-5 fill-white/20" />
              {t.water}
            </div>
            {/* Beautiful Connected Quick Buttons */}
            <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/5 shadow-inner">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-white hover:bg-white/10 border-none"
                onClick={() => addWater(-250)}
              >
                <Minus size={14} />
              </Button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-white hover:bg-white/10 border-none"
                onClick={() => addWater(250)}
              >
                <Plus size={14} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-baseline space-x-1">
                <span className="text-5xl font-black tracking-tighter">{todayTotals.water}</span>
                <span className="text-sm font-bold opacity-70">/ {profile.targetWater} {t.ml}</span>
              </div>
            </div>

            {/* Custom Log Input Group */}
            <div className="flex items-center bg-white/10 rounded-2xl p-1.5 pl-3 border border-white/5 focus-within:border-white/30 transition-all">
              <Input 
                type="number"
                placeholder={t.ml}
                value={customWater}
                onChange={(e) => setCustomWater(e.target.value)}
                className="bg-transparent border-none text-white placeholder:text-white/40 h-8 p-0 text-sm font-bold focus-visible:ring-0 shadow-none"
              />
              <Button 
                onClick={handleCustomWaterAdd}
                size="sm"
                className="bg-white text-sky-600 hover:bg-white/90 font-black rounded-xl h-8 px-4 text-[10px] tracking-widest uppercase"
              >
                Log
              </Button>
            </div>
          </div>

          <div className="space-y-2">
             <div className="macro-bar-container bg-white/20 h-2">
                <div 
                  className="macro-bar-fill bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                  style={{ width: `${Math.min(waterPercentage, 100)}%` }}
                />
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-70">
               <span>Daily Intake</span>
               <span>{waterPercentage}%</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MacroItem({ label, current, target, unit, color }: { label: string, current: number, target: number, unit: string, color: string }) {
  const { t } = useI18n();
  const percentage = Math.round((current / (target || 1)) * 100);
  const diff = target - Math.round(current);
  const isOver = diff < 0;
  
  return (
    <Card className="border-none shadow-sm p-4 space-y-3 bg-card transition-all rounded-2xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <span className="font-bold text-foreground">{label}</span>
        </div>
        <span className="font-extrabold text-foreground">{Math.round(current)} <span className="text-muted-foreground font-medium text-xs">/ {target} {unit}</span></span>
      </div>
      <div className="space-y-2">
        <div className="macro-bar-container bg-muted/50 h-2">
          <div 
            className={cn("macro-bar-fill", color)} 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-muted-foreground">
          <span>{percentage}%</span>
          <p>
            {isOver ? t.overeaten : t.remaining}: {Math.abs(diff)} {unit}
          </p>
        </div>
      </div>
    </Card>
  );
}