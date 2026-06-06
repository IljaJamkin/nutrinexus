"use client";

import { useData } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Image from "next/image";

export function DailyLogs() {
  const { logs, removeLog, loading } = useData();
  const { t } = useI18n();

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline text-primary">{t.history}</h1>
      </header>

      {logs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No food logs yet. Try scanning your meal!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="p-3 border-none shadow-sm flex items-center space-x-4 group">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                {log.image ? (
                  <Image src={log.image} alt={log.foodName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                     <span className="text-primary font-bold">N</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{log.foodName}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">C: {log.calories}</span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">p: {log.protein}g</span>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">ch: {log.carbs}g</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">f: {log.fats}g</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeLog(log.id)}
              >
                <Trash2 size={16} />
                <span className="sr-only">{t.delete}</span>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
