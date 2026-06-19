import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BarChart3, Trophy, TrendingUp, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WEIGHT_CLASSES, getWeightClassName } from "@/lib/weightClasses";
import { motion } from "framer-motion";

export default function Rankings() {
  const [selectedDivision, setSelectedDivision] = useState("all");

  const { data: fighters = [], isLoading } = useQuery({
    queryKey: ["fighters-ranked"],
    queryFn: () => base44.entities.Fighter.list("-ranking_points", 100),
  });

  // Ordem fixa dos lutadores: Mortari primeiro, Polastrine segundo
  const FIGHTER_ORDER = ["Mortari", "Polastrine", "Pedinho", "Batista"];

  const sortFighters = (list) =>
    [...list].sort((a, b) => {
      const ia = FIGHTER_ORDER.indexOf(a.name);
      const ib = FIGHTER_ORDER.indexOf(b.name);
      if (ia === -1 && ib === -1) return (b.ranking_points || 0) - (a.ranking_points || 0);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

  const divisions = selectedDivision === "all"
    ? WEIGHT_CLASSES
    : WEIGHT_CLASSES.filter(wc => wc.id === selectedDivision);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-5xl sm:text-6xl tracking-wide text-foreground flex items-center gap-4">
          <BarChart3 className="w-10 h-10 text-primary" />
          RANKINGS
        </h1>
        <p className="text-muted-foreground font-display text-sm tracking-wider mt-2">
          OFFICIAL APEX MMA POUND-FOR-POUND RANKINGS
        </p>
      </div>

      {/* Division Tabs */}
      <div className="mb-8 overflow-x-auto">
        <Tabs value={selectedDivision} onValueChange={setSelectedDivision}>
          <TabsList className="bg-card border border-border h-auto flex-wrap">
            <TabsTrigger value="all" className="font-display tracking-wider text-xs">ALL</TabsTrigger>
            {WEIGHT_CLASSES.map(wc => (
              <TabsTrigger key={wc.id} value={wc.id} className="font-display tracking-wider text-xs">
                {wc.name.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Rankings by Division */}
      <div className="space-y-10">
        {divisions.map(division => {
          const divFighters = sortFighters(fighters.filter(f => f.weight_class === division.id));

          if (divFighters.length === 0) return null;

          const champion = divFighters.find(f => f.is_champion);
          const contenders = divFighters.filter(f => !f.is_champion);

          return (
            <div key={division.id}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-heading text-3xl tracking-wide text-foreground">
                  {division.name.toUpperCase()}
