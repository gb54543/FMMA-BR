import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Swords, Trophy, Users, Calendar, ChevronRight, TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWeightClassName } from "@/lib/weightClasses";
import FighterCard from "@/components/fighters/FighterCard";
import { motion } from "framer-motion";

export default function Home() {
  const { data: fighters = [] } = useQuery({
    queryKey: ["fighters"],
    queryFn: () => base44.entities.Fighter.list("-ranking_points", 50),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events-upcoming"],
    queryFn: () => base44.entities.Event.filter({ status: "upcoming" }, "-date", 3),
  });

  const { data: recentFights = [] } = useQuery({
    queryKey: ["recent-fights"],
    queryFn: () => base44.entities.Fight.filter({ status: "completed" }, "-created_date", 5),
  });

  const champions = fighters.filter(f => f.is_champion);
  const topFighters = fighters.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 font-display tracking-wider mb-6">
              <Flame className="w-3 h-3 mr-1" /> CAMPEONATO AO VIVO
            </Badge>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl leading-none tracking-tight">
              <span className="text-foreground">FMMA</span>
              <br />
              <span className="text-gradient">BRASIL</span>
            </h1>
            <p className="font-display text-lg sm:text-xl text-muted-foreground tracking-wider mt-4 max-w-lg">
              CAMPEONATO DE ARTES MARCIAIS MISTAS
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/fighters">
                <Button size="lg" className="bg-primary hover:bg-primary/90 font-display tracking-wider text-sm px-8">
                  <Users className="w-4 h-4 mr-2" /> VER LUTADORES
                </Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline" className="font-display tracking-wider text-sm px-8 border-primary/30 hover:bg-primary/10">
                  <Calendar className="w-4 h-4 mr-2" /> PRÓXIMOS EVENTOS
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-3 gap-6 mt-16 max-w-md"
          >
