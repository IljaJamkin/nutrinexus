"use client";

import { useState, useEffect } from "react";
import { useData, UserProfile, ThemeType } from "@/components/local-data-provider";
import { useI18n } from "@/lib/i18n-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, UserCircle, Palette, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function Settings() {
  const { profile, updateProfile, loading } = useData();
  const { t, language, setLanguage } = useI18n();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    
    // Calculate BMR using Mifflin-St Jeor
    const s = formData.gender === 'male' ? 5 : -161;
    const bmr = (10 * formData.weight) + (6.25 * formData.height) - (5 * formData.age) + s;
    const tdee = Math.round(bmr * formData.activityLevel);

    // Simple Macro Ratio: 30% Protein, 40% Carbs, 30% Fats
    const p = Math.round((tdee * 0.3) / 4);
    const c = Math.round((tdee * 0.4) / 4);
    const f = Math.round((tdee * 0.3) / 9);

    const waterGoal = Math.round(formData.weight * 35);

    const updatedProfile = {
      ...formData,
      targetCalories: tdee,
      targetProtein: p,
      targetCarbs: c,
      targetFats: f,
      targetWater: waterGoal
    };

    updateProfile(updatedProfile);
    toast({ title: "Profile Updated", description: "Your goals and settings have been saved." });
    setSaving(false);
  };

  const updateTheme = (theme: ThemeType) => {
    const newProfile = { ...formData, theme };
    setFormData(newProfile);
    updateProfile(newProfile);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline text-primary">{t.settings}</h1>
      </header>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Language Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center">
                <Globe className="mr-2" size={16} /> {t.language}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(['en', 'es', 'ru'] as const).map(lang => (
                  <Button
                    key={lang}
                    variant={language === lang ? "default" : "outline"}
                    className="flex-1 rounded-xl uppercase text-xs"
                    onClick={() => setLanguage(lang)}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center">
                <Palette className="mr-2" size={16} /> {t.theme}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <ThemeButton 
                  active={formData.theme === 'purple'} 
                  label={t.themeDefault} 
                  color="bg-indigo-600 border-indigo-400" 
                  onClick={() => updateTheme('purple')} 
                />
                <ThemeButton 
                  active={formData.theme === 'white'} 
                  label={t.themeWhite} 
                  color="bg-white border-gray-200" 
                  onClick={() => updateTheme('white')} 
                />
                <ThemeButton 
                  active={formData.theme === 'black'} 
                  label={t.themeBlack} 
                  color="bg-black border-gray-800" 
                  onClick={() => updateTheme('black')} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center">
                <UserCircle className="mr-2" size={16} /> {t.profile}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SettingInput 
                  label={t.weight} 
                  value={formData.weight} 
                  onChange={(val) => setFormData({...formData, weight: val})} 
                />
                <SettingInput 
                  label={t.height} 
                  value={formData.height} 
                  onChange={(val) => setFormData({...formData, height: val})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SettingInput 
                  label={t.age} 
                  value={formData.age} 
                  onChange={(val) => setFormData({...formData, age: val})} 
                />
                 <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gender</Label>
                  <Select value={formData.gender} onValueChange={(val: any) => setFormData({...formData, gender: val})}>
                    <SelectTrigger className="rounded-xl h-10 border-none bg-white/5 font-bold">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.activity}</Label>
                <Select value={formData.activityLevel.toString()} onValueChange={(val) => setFormData({...formData, activityLevel: Number(val)})}>
                  <SelectTrigger className="rounded-xl h-10 border-none bg-white/5 font-bold">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.2">{t.sedentary}</SelectItem>
                    <SelectItem value="1.375">{t.light}</SelectItem>
                    <SelectItem value="1.55">{t.moderate}</SelectItem>
                    <SelectItem value="1.725">{t.active}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full rounded-2xl h-12 text-lg mt-4 shadow-lg shadow-primary/20" onClick={handleSave} disabled={saving}>
                {saving ? "..." : t.save}
              </Button>
            </CardContent>
          </Card>
          
          <div className="p-4 bg-accent/50 rounded-2xl border border-accent">
             <h4 className="font-bold text-accent-foreground text-sm mb-2">Daily Calculated Targets</h4>
             <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
               <div className="flex justify-between"><span>Calories:</span> <span className="font-bold">{profile.targetCalories} kcal</span></div>
               <div className="flex justify-between"><span>Protein:</span> <span className="font-bold">{profile.targetProtein}g</span></div>
               <div className="flex justify-between"><span>Carbs:</span> <span className="font-bold">{profile.targetCarbs}g</span></div>
               <div className="flex justify-between"><span>Fats:</span> <span className="font-bold">{profile.targetFats}g</span></div>
               <div className="flex justify-between"><span>Water:</span> <span className="font-bold">{profile.targetWater}ml</span></div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

function SettingInput({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{label}</Label>
      <div className="relative group">
        <Input 
          type="number" 
          value={value || 0} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded-xl pr-16 bg-white/5 border-none font-bold focus-visible:ring-primary"
        />
        <div className="absolute right-1 top-1 bottom-1 flex gap-0.5">
          <button 
            onClick={() => onChange(Math.max(0, value - 1))}
            className="w-7 h-full flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-primary transition-all active:scale-90"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={() => onChange(value + 1)}
            className="w-7 h-full flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-primary transition-all active:scale-90"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeButton({ active, label, color, onClick }: { active: boolean, label: string, color: string, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2 ${active ? 'border-primary bg-primary/5' : 'border-transparent'}`}
    >
      <div className={`w-full aspect-square rounded-lg border shadow-sm ${color}`} />
      <span className={`text-[10px] font-bold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
    </button>
  );
}