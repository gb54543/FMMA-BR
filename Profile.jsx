import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Swords, Save, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WEIGHT_CLASSES } from "@/lib/weightClasses";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myFighter } = useQuery({
    queryKey: ["my-fighter", user?.fighter_id],
    queryFn: async () => {
      if (!user?.fighter_id) return null;
      const list = await base44.entities.Fighter.filter({ id: user.fighter_id });
      return list[0] || null;
    },
    enabled: !!user,
  });

  const [fighterForm, setFighterForm] = useState(null);
  const [showForm, setShowForm] = useState(false);

  React.useEffect(() => {
    if (myFighter) {
      setFighterForm({
        name: myFighter.name || "",
        nickname: myFighter.nickname || "",
        nationality: myFighter.nationality || "",
        age: myFighter.age || "",
        height_cm: myFighter.height_cm || "",
        weight_kg: myFighter.weight_kg || "",
        reach_cm: myFighter.reach_cm || "",
        weight_class: myFighter.weight_class || "lightweight",
        fighting_style: myFighter.fighting_style || "",
        gym: myFighter.gym || "",
        bio: myFighter.bio || "",
      });
    }
  }, [myFighter]);

  const createFighterMutation = useMutation({
    mutationFn: async (data) => {
      const fighter = await base44.entities.Fighter.create({
        ...data,
        user_id: user.id,
        age: data.age ? Number(data.age) : undefined,
        height_cm: data.height_cm ? Number(data.height_cm) : undefined,
        weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
        reach_cm: data.reach_cm ? Number(data.reach_cm) : undefined,
      });
      await base44.auth.updateMe({ role: "fighter", fighter_id: fighter.id });
      return fighter;
    },
    onSuccess: () => {
      toast.success("Fighter profile created!");
      queryClient.invalidateQueries({ queryKey: ["my-fighter"] });
      setShowForm(false);
      window.location.reload();
    },
  });

  const updateFighterMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Fighter.update(myFighter.id, {
        ...data,
        age: data.age ? Number(data.age) : undefined,
        height_cm: data.height_cm ? Number(data.height_cm) : undefined,
        weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
        reach_cm: data.reach_cm ? Number(data.reach_cm) : undefined,
      }),
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["my-fighter"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (myFighter) {
      updateFighterMutation.mutate(fighterForm);
    } else {
      createFighterMutation.mutate(fighterForm);
    }
  };

  const initNewForm = () => {
    setFighterForm({
      name: user?.full_name || "",
      nickname: "",
      nationality: "",
      age: "",
      height_cm: "",
      weight_kg: "",
      reach_cm: "",
      weight_class: "lightweight",
      fighting_style: "",
      gym: "",
      bio: "",
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-5xl tracking-wide text-foreground flex items-center gap-4">
          <User className="w-10 h-10 text-primary" />
          MY PROFILE
        </h1>
        <p className="text-muted-foreground font-display text-sm tracking-wider mt-2">
          {user?.email}
        </p>
      </div>

      {/* Role Info */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-display tracking-wider text-muted-foreground">ACCOUNT ROLE</p>
            <Badge variant="outline" className="mt-1 font-display tracking-wider text-sm border-primary/30 text-primary">
              {user?.role?.toUpperCase() || "USER"}
            </Badge>
          </div>
          {myFighter && (
            <Link to={`/fighter/${myFighter.id}`}>
              <Button variant="outline" className="font-display tracking-wider text-sm">
                <Swords className="w-4 h-4 mr-2" /> VIEW PUBLIC PROFILE
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Fighter Profile */}
      {myFighter && fighterForm ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-heading text-2xl tracking-wide mb-6 flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" /> FIGHTER PROFILE
          </h2>

          {myFighter.is_champion && (
            <div className="bg-gradient-fire p-3 rounded-lg mb-6 text-center">
              <p className="font-display text-sm tracking-wider text-white flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" /> YOU ARE THE CHAMPION <Trophy className="w-4 h-4" />
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-display tracking-wider text-xs">FIGHTER NAME</Label>
                <Input value={fighterForm.name} onChange={e => setFighterForm({ ...fighterForm, name: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">NICKNAME</Label>
                <Input value={fighterForm.nickname} onChange={e => setFighterForm({ ...fighterForm, nickname: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">WEIGHT CLASS</Label>
                <Select value={fighterForm.weight_class} onValueChange={v => setFighterForm({ ...fighterForm, weight_class: v })}>
                  <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEIGHT_CLASSES.map(wc => (
                      <SelectItem key={wc.id} value={wc.id}>{wc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">FIGHTING STYLE</Label>
                <Input value={fighterForm.fighting_style} onChange={e => setFighterForm({ ...fighterForm, fighting_style: e.target.value })} className="bg-muted border-border mt-1" placeholder="e.g. Boxing, BJJ, Wrestling" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">AGE</Label>
                <Input type="number" value={fighterForm.age} onChange={e => setFighterForm({ ...fighterForm, age: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">HEIGHT (cm)</Label>
                <Input type="number" value={fighterForm.height_cm} onChange={e => setFighterForm({ ...fighterForm, height_cm: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">WEIGHT (kg)</Label>
                <Input type="number" value={fighterForm.weight_kg} onChange={e => setFighterForm({ ...fighterForm, weight_kg: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">REACH (cm)</Label>
                <Input type="number" value={fighterForm.reach_cm} onChange={e => setFighterForm({ ...fighterForm, reach_cm: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">NATIONALITY</Label>
                <Input value={fighterForm.nationality} onChange={e => setFighterForm({ ...fighterForm, nationality: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">GYM</Label>
                <Input value={fighterForm.gym} onChange={e => setFighterForm({ ...fighterForm, gym: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
            </div>
            <div>
              <Label className="font-display tracking-wider text-xs">BIO</Label>
              <Textarea value={fighterForm.bio} onChange={e => setFighterForm({ ...fighterForm, bio: e.target.value })} className="bg-muted border-border mt-1" rows={3} />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90 font-display tracking-wider">
              <Save className="w-4 h-4 mr-2" /> SAVE PROFILE
            </Button>
          </form>
        </div>
      ) : !myFighter ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-2xl tracking-wide mb-2">BECOME A FIGHTER</h2>
          <p className="text-sm text-muted-foreground mb-6">Create your fighter profile to enter the arena.</p>
          {showForm ? (
            <form onSubmit={handleSubmit} className="text-left space-y-4 max-w-lg mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wider text-xs">FIGHTER NAME *</Label>
                  <Input value={fighterForm?.name || ""} onChange={e => setFighterForm({ ...fighterForm, name: e.target.value })} className="bg-muted border-border mt-1" required />
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">NICKNAME</Label>
                  <Input value={fighterForm?.nickname || ""} onChange={e => setFighterForm({ ...fighterForm, nickname: e.target.value })} className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">WEIGHT CLASS *</Label>
                  <Select value={fighterForm?.weight_class || "lightweight"} onValueChange={v => setFighterForm({ ...fighterForm, weight_class: v })}>
                    <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEIGHT_CLASSES.map(wc => (
                        <SelectItem key={wc.id} value={wc.id}>{wc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">FIGHTING STYLE</Label>
                  <Input value={fighterForm?.fighting_style || ""} onChange={e => setFighterForm({ ...fighterForm, fighting_style: e.target.value })} className="bg-muted border-border mt-1" />
                </div>
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 font-display tracking-wider w-full">
                <Plus className="w-4 h-4 mr-2" /> CREATE FIGHTER PROFILE
              </Button>
            </form>
          ) : (
            <Button onClick={initNewForm} className="bg-primary hover:bg-primary/90 font-display tracking-wider">
              <Plus className="w-4 h-4 mr-2" /> CREATE FIGHTER PROFILE
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
