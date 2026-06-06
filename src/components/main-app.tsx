
"use client";

import { useState } from "react";
import { LayoutDashboard, Camera, ClipboardList, UserCircle, Dumbbell } from "lucide-react";
import { Dashboard } from "@/components/dashboard";
import { NutriScan } from "@/components/nutriscan";
import { DailyLogs } from "@/components/daily-logs";
import { Settings } from "@/components/settings";
import { Workouts } from "@/components/workouts";
import { useI18n } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

export function MainApp() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "scan" | "workouts" | "logs" | "settings">("dashboard");
  const { t } = useI18n();

  const tabs = [
    { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
    { id: "scan", label: t.nutriScan, icon: Camera },
    { id: "workouts", label: t.workouts, icon: Dumbbell },
    { id: "logs", label: t.logs, icon: ClipboardList },
    { id: "settings", label: t.settings, icon: UserCircle },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="flex-1 overflow-y-auto pb-32 px-4 pt-6 max-w-md mx-auto w-full">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "scan" && <NutriScan onSuccess={() => setActiveTab("logs")} />}
        {activeTab === "workouts" && <Workouts />}
        {activeTab === "logs" && <DailyLogs />}
        {activeTab === "settings" && <Settings />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-3 flex justify-around items-center z-50 rounded-t-2xl shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-300 flex-1",
                isActive ? "text-primary transform scale-105" : "text-muted-foreground opacity-70"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive ? "bg-accent" : "bg-transparent"
              )}>
                <Icon size={22} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
