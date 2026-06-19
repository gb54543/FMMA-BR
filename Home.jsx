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
            {[
              { label: "LUTADORES", value: fighters.length, icon: Users },
              { label: "CAMPEÕES", value: champions.length, icon: Trophy },
              { label: "EVENTOS", value: events.length, icon: Calendar },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-heading text-3xl text-foreground">{stat.value}</p>
                <p className="text-xs font-display tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Champions */}
      {champions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-4xl tracking-wide text-foreground flex items-center gap-3">
                <Trophy className="w-8 h-8 text-secondary" />
                CURRENT CHAMPIONS
              </h2>
              <p className="text-muted-foreground font-display text-sm tracking-wider mt-1">DIVISION TITLE HOLDERS</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {champions.map(champ => (
              <Link key={champ.id} to={`/fighter/${champ.id}`}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-card border border-secondary/30 rounded-xl p-5 glow-gold hover:border-secondary/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-accent overflow-hidden flex-shrink-0">
                      {champ.photo_url ? (
                        <img src={champ.photo_url} alt={champ.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-heading text-xl text-muted-foreground">{champ.name?.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-display tracking-wider text-secondary">
                        {getWeightClassName(champ.weight_class)?.toUpperCase()}
                      </p>
                      <p className="font-heading text-lg tracking-wide">{champ.name?.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{champ.wins}-{champ.losses}-{champ.draws}</p>
                    </div>
                  </div>
                  <Trophy className="absolute top-3 right-3 w-5 h-5 text-secondary/40" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Fighters */}
      {topFighters.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-4xl tracking-wide text-foreground flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                TOP RANKED
              </h2>
              <p className="text-muted-foreground font-display text-sm tracking-wider mt-1">POUND-FOR-POUND</p>
            </div>
            <Link to="/rankings">
              <Button variant="ghost" className="font-display tracking-wider text-sm">
                VIEW ALL <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topFighters.map((fighter, i) => (
              <FighterCard key={fighter.id} fighter={fighter} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-4xl tracking-wide text-foreground flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                UPCOMING EVENTS
              </h2>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="font-display tracking-wider text-sm">
                VIEW ALL <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map(event => (
              <Link key={event.id} to={`/event/${event.id}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all"
                >
                  {event.poster_url && (
                    <img src={event.poster_url} alt={event.name} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-5">
                    <Badge variant="outline" className="font-display text-xs tracking-wider border-primary/30 text-primary mb-2">
                      {event.status?.toUpperCase()}
                    </Badge>
                    <h3 className="font-heading text-xl tracking-wide">{event.name?.toUpperCase()}</h3>
                    {event.subtitle && <p className="text-sm text-muted-foreground mt-1">{event.subtitle}</p>}
                    <div className="mt-3 text-xs text-muted-foreground font-display tracking-wider">
                      {event.date && new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
                      {event.venue && ` • ${event.venue}`}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Results */}
      {recentFights.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="font-heading text-4xl tracking-wide text-foreground flex items-center gap-3 mb-8">
            <Swords className="w-8 h-8 text-primary" />
            RECENT RESULTS
          </h2>
          <div className="space-y-3">
            {recentFights.map(fight => {
              const winner = fighters.find(f => f.id === fight.winner_id);
              return (
                <div key={fight.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    {fight.is_title_fight && <Trophy className="w-4 h-4 text-secondary" />}
                    <div>
                      <p className="font-heading text-sm tracking-wide">
                        {fight.fighter1_name?.toUpperCase()} vs {fight.fighter2_name?.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground font-display tracking-wider">
                        {getWeightClassName(fight.weight_class)?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display tracking-wider text-primary">
                      {winner?.name?.toUpperCase()} wins
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fight.method} {fight.round ? `• R${fight.round}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
