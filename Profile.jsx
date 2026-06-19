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
