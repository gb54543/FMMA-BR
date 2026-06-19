import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ChevronRight, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function Events() {
  const [tab, setTab] = useState("upcoming");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", tab],
    queryFn: () => {
      if (tab === "all") return base44.entities.Event.list("-date", 50);
      return base44.entities.Event.filter({ status: tab }, "-date", 50);
    },
  });

  const statusColors = {
    upcoming: "border-blue-500/30 text-blue-400",
    live: "border-green-500/30 text-green-400",
    completed: "border-muted-foreground/30 text-muted-foreground",
    cancelled: "border-red-500/30 text-red-400",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-5xl sm:text-6xl tracking-wide text-foreground flex items-center gap-4">
          <Calendar className="w-10 h-10 text-primary" />
          EVENTS
        </h1>
        <p className="text-muted-foreground font-display text-sm tracking-wider mt-2">
          APEX MMA FIGHT CARDS
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="upcoming" className="font-display tracking-wider text-xs">UPCOMING</TabsTrigger>
          <TabsTrigger value="live" className="font-display tracking-wider text-xs">LIVE</TabsTrigger>
          <TabsTrigger value="completed" className="font-display tracking-wider text-xs">COMPLETED</TabsTrigger>
          <TabsTrigger value="all" className="font-display tracking-wider text-xs">ALL</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-heading text-2xl text-muted-foreground">NO EVENTS FOUND</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, i) => (
            <Link key={event.id} to={`/event/${event.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
                className={`bg-card border rounded-xl overflow-hidden hover:border-primary/30 transition-all group ${
                  event.status === "live" ? "border-green-500/30 glow-red" : "border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row">
                  {event.poster_url && (
                    <div className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                      <img src={event.poster_url} alt={event.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`font-display text-xs tracking-wider ${statusColors[event.status] || ""}`}>
                          {event.status === "live" && <Flame className="w-3 h-3 mr-1" />}
                          {event.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="font-heading text-2xl sm:text-3xl tracking-wide group-hover:text-primary transition-colors">
                        {event.name?.toUpperCase()}
                      </h3>
                      {event.subtitle && <p className="text-sm text-muted-foreground mt-1">{event.subtitle}</p>}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground font-display tracking-wider">
                        {event.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
                          </span>
                        )}
                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.venue.toUpperCase()}{event.city ? `, ${event.city.toUpperCase()}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
