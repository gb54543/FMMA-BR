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
              <p className="font-display text-sm tracking-wider text-primary">"{fighter.nickname.toUpperCase()}"</p>
            )}
            <h1 className="font-heading text-5xl sm:text-6xl tracking-wide text-foreground mt-1">
              {fighter.name?.toUpperCase()}
            </h1>

            {/* Medidas físicas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Ruler, label: "ALTURA", value: fighter.height_cm ? `${fighter.height_cm} m` : "—" },
                { icon: Weight, label: "PESO", value: fighter.weight_kg ? `${fighter.weight_kg} kg` : "—" },
                { icon: Target, label: "ENVERGADURA", value: fighter.reach_cm ? `${fighter.reach_cm} cm` : "—" },
                { icon: Flame, label: "IDADE", value: fighter.age || "—" },
              ].map(stat => (
                <div key={stat.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="font-heading text-xl text-foreground">{stat.value}</p>
                  <p className="text-xs font-display tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info + Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Fighter Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading text-xl tracking-wide mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            INFORMAÇÕES
          </h3>
          <div className="space-y-4">
            {[
              { label: "ESTILO DE LUTA", value: fighter.fighting_style },
              { label: "ACADEMIA", value: fighter.gym },
              { label: "NACIONALIDADE", value: fighter.nationality },
              { label: "DIVISÃO", value: getWeightClassName(fighter.weight_class) },
            ].filter(item => item.value).map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <span className="text-xs font-display tracking-wider text-muted-foreground">{item.label}</span>
                <span className="text-sm font-display tracking-wider text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          {fighter.bio && (
            <div className="mt-6">
              <p className="text-xs font-display tracking-wider text-muted-foreground mb-2">BIO</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{fighter.bio}</p>
            </div>
          )}
        </div>

        {/* Histórico de lutas */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading text-xl tracking-wide mb-6 flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            HISTÓRICO DE LUTAS ({fights.length})
          </h3>
          {fights.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma luta registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {fights.slice(0, 10).map(fight => {
                const won = fight.winner_id === fighter.id;
                const opponentName = fight.fighter1_id === fighter.id ? fight.fighter2_name : fight.fighter1_name;
                return (
                  <div key={fight.id} className={`p-3 rounded-lg border ${won ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-heading text-sm tracking-wide">
                          vs {opponentName?.toUpperCase() || "DESCONHECIDO"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{fight.method}</p>
                      </div>
                      <Badge className={`${won ? "bg-green-600/20 text-green-500" : "bg-red-600/20 text-red-500"} font-display text-xs`}>
                        {won ? "VITÓRIA" : "DERROTA"}
                      </Badge>
                    </div>
                    {fight.round && (
                      <p className="text-xs text-muted-foreground mt-1">Round {fight.round} {fight.time && `• ${fight.time}`}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
