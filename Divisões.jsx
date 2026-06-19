import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Trophy, Users, ChevronRight } from "lucide-react";
import { WEIGHT_CLASSES, getWeightClassName } from "@/lib/weightClasses";
import { motion } from "framer-motion";

export default function Divisions() {
  const { data: fighters = [] } = useQuery({
    queryKey: ["fighters"],
    queryFn: () => base44.entities.Fighter.list("-ranking_points", 200),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-5xl sm:text-6xl tracking-wide text-foreground flex items-center gap-4">
          <Trophy className="w-10 h-10 text-secondary" />
          DIVISIONS
        </h1>
        <p className="text-muted-foreground font-display text-sm tracking-wider mt-2">
          WEIGHT CLASS CHAMPIONSHIPS
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {WEIGHT_CLASSES.map((division, i) => {
          const divFighters = fighters.filter(f => f.weight_class === division.id);
          const champion = divFighters.find(f => f.is_champion);
          const count = divFighters.length;

          return (
            <motion.div
              key={division.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/rankings?division=${division.id}`}>
                <div className={`bg-card border rounded-xl p-6 hover:border-primary/30 transition-all group ${
                  champion ? "border-secondary/20" : "border-border"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading text-2xl tracking-wide group-hover:text-primary transition-colors">
                          {division.name.toUpperCase()}
                        </h3>
                      </div>
                      <p className="text-xs font-display tracking-wider text-muted-foreground">{division.limit}</p>

                      {champion ? (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent overflow-hidden ring-2 ring-secondary/40 flex items-center justify-center flex-shrink-0">
                            {champion.photo_url ? (
                              <img src={champion.photo_url} alt={champion.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-heading text-sm text-muted-foreground">{champion.name?.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-heading text-base text-secondary leading-none">C</span>
                              <span className="text-xs font-display tracking-wider text-secondary">CAMPEÃO</span>
                            </div>
                            <p className="font-heading text-sm tracking-wide">{champion.name?.toUpperCase()}</p>
                            {champion.nickname && (
                              <p className="text-xs text-primary font-display">"{champion.nickname}"</p>
                            )}
                            {champion.fighting_style && (
                              <p className="text-xs text-muted-foreground font-display tracking-wider mt-0.5">{champion.fighting_style}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <p className="text-xs font-display tracking-wider text-muted-foreground">TITLE VACANT</p>
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span className="font-display tracking-wider">{count} FIGHTERS</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
