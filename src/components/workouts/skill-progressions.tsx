
"use client";

import { useState } from "react";
import { useData, SkillProgression, SkillProgressionLevel } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function SkillProgressions() {
  const { skillProgressions, saveSkillProgression, deleteSkillProgression } = useData();
  const { t } = useI18n();
  const { toast } = useToast();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", level: "assisted" as SkillProgressionLevel });

  const handleAdd = () => {
    if (!newSkill.name) return;
    saveSkillProgression({
      id: Math.random().toString(36).substr(2, 9),
      name: newSkill.name,
      level: newSkill.level,
      bestHoldTime: 0,
      bestReps: 0
    });
    setNewSkill({ name: "", level: "assisted" });
    setIsAdding(false);
    toast({ title: "Skill Added" });
  };

  const updateSkill = (skill: SkillProgression, updates: Partial<SkillProgression>) => {
    saveSkillProgression({ ...skill, ...updates });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
          <Award size={20} className="text-primary" />
          {t.skillProgressions}
        </h2>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setIsAdding(!isAdding)}>
          <Plus size={20} className={cn("transition-transform", isAdding && "rotate-45")} />
        </Button>
      </header>

      {isAdding && (
        <Card className="border-2 border-primary/20 animate-in slide-in-from-top-4">
           <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                 <Input 
                   placeholder={t.skillName} 
                   value={newSkill.name} 
                   onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                   className="rounded-xl"
                 />
                 <Select value={newSkill.level} onValueChange={(val: any) => setNewSkill({...newSkill, level: val})}>
                   <SelectTrigger className="rounded-xl">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="assisted">{t.assisted}</SelectItem>
                      <SelectItem value="negative">{t.negative}</SelectItem>
                      <SelectItem value="full">{t.full}</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <Button className="w-full rounded-xl font-bold" onClick={handleAdd}>{t.addSkill}</Button>
           </CardContent>
        </Card>
      )}

      {skillProgressions.length === 0 && !isAdding ? (
        <div className="text-center py-6 text-muted-foreground text-sm italic">
           Track your journey from assisted to full skills here.
        </div>
      ) : (
        <div className="grid gap-4">
          {skillProgressions.map((skill) => (
            <Card key={skill.id} className="border-none shadow-sm group overflow-hidden bg-card">
               <div className={cn(
                 "absolute top-0 left-0 bottom-0 w-1",
                 skill.level === 'full' ? 'bg-emerald-500' : skill.level === 'negative' ? 'bg-orange-500' : 'bg-primary'
               )} />
               <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="font-bold text-lg">{skill.name}</h4>
                        <div className="flex gap-2 mt-1">
                           {(['assisted', 'negative', 'full'] as const).map(lvl => (
                             <button
                               key={lvl}
                               onClick={() => updateSkill(skill, { level: lvl })}
                               className={cn(
                                 "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border transition-all",
                                 skill.level === lvl 
                                   ? "bg-primary border-primary text-white" 
                                   : "border-muted text-muted-foreground hover:border-primary/50"
                               )}
                             >
                               {t[lvl as keyof typeof t] as string}
                             </button>
                           ))}
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteSkillProgression(skill.id)}>
                        <Trash2 size={14} />
                     </Button>
                  </div>

                  <div className="flex gap-3">
                     <div className="flex-1 bg-accent/50 p-2 rounded-xl text-center space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Best Hold</span>
                        <div className="flex items-center justify-center gap-1">
                           <TrendingUp size={10} className="text-primary" />
                           <Input 
                             type="number" 
                             value={skill.bestHoldTime} 
                             onChange={(e) => updateSkill(skill, { bestHoldTime: Number(e.target.value) })}
                             className="h-6 w-12 p-0 text-center border-none bg-transparent font-bold text-sm focus-visible:ring-0"
                           />
                           <span className="text-[10px] font-bold">s</span>
                        </div>
                     </div>
                     <div className="flex-1 bg-accent/50 p-2 rounded-xl text-center space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Max Reps</span>
                        <div className="flex items-center justify-center gap-1">
                           <TrendingUp size={10} className="text-primary" />
                           <Input 
                             type="number" 
                             value={skill.bestReps} 
                             onChange={(e) => updateSkill(skill, { bestReps: Number(e.target.value) })}
                             className="h-6 w-12 p-0 text-center border-none bg-transparent font-bold text-sm focus-visible:ring-0"
                           />
                           <span className="text-[10px] font-bold">R</span>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
