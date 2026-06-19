import React from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Dumbbell, Ruler, Weight, Flame, Target, Shield, ArrowLeft, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWeightClassName } from "@/lib/weightClasses";
import { motion } from "framer-motion";

export default function FighterProfile() {
  const { id } = useParams();

  const { data: fighter, isLoading } = useQuery({
    queryKey: ["fighter", id],
    queryFn: async () => {
      const list = await base44.entities.Fighter.filter({ id });
      return list[0];
    },
  });

  const { data: fights = [] } = useQuery({
    queryKey: ["fighter-fights", id],
    queryFn: async () => {
      const [asF1, asF2] = await Promise.all([
        base44.entities.Fight.filter({ fighter1_id: id, status: "completed" }),
        base44.entities.Fight.filter({ fighter2_id: id, status: "completed" }),
      ]);
      return [...asF1, ...asF2].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="text-center py-20 max-w-7xl mx-auto px-4">
        <p className="font-heading text-3xl text-muted-foreground">LUTADOR NÃO ENCONTRADO</p>
        <Link to="/fighters"><Button className="mt-4">VOLTAR AOS LUTADORES</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/fighters">
        <Button variant="ghost" className="mb-6 font-display tracking-wider text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> TODOS OS LUTADORES
        </Button>
      </Link>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Foto */}
          <div className="relative h-72 lg:h-auto bg-gradient-to-b from-muted to-card flex items-center justify-center">
            {fighter.photo_url ? (
              <img src={fighter.photo_url} alt={fighter.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-accent flex items-center justify-center">
                <span className="font-heading text-5xl text-muted-foreground">{fighter.name?.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-card" />
          </div>

          {/* Info */}
          <div className="relative p-8 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge variant="outline" className="font-display text-xs tracking-wider border-primary/30 text-primary">
                {getWeightClassName(fighter.weight_class)?.toUpperCase()}
              </Badge>
              {fighter.is_champion && (
                <Badge className="bg-gradient-fire text-white font-display text-xs tracking-wider border-0">
                  <Trophy className="w-3 h-3 mr-1" /> CAMPEÃO
                </Badge>
              )}
              <Badge variant="outline" className={`font-display text-xs tracking-wider ${
                fighter.status === "active" ? "border-green-500/30 text-green-500" : "border-muted-foreground/30 text-muted-foreground"
              }`}>
                {fighter.status === "active" ? "ATIVO" : fighter.status?.toUpperCase()}
              </Badge>
            </div>

            {fighter.nickname && (
 
