import React from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, ArrowLeft, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FightCard from "@/components/events/FightCard";

export default function EventDetail() {
  const { id } = useParams();

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const list = await base44.entities.Event.filter({ id });
      return list[0];
    },
  });

  const { data: fights = [] } = useQuery({
    queryKey: ["event-fights", id],
    queryFn: () => base44.entities.Fight.filter({ event_id: id }, "fight_order"),
  });

  const { data: fighters = [] } = useQuery({
    queryKey: ["all-fighters"],
    queryFn: () => base44.entities.Fighter.list(),
  });

  if (loadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 max-w-7xl mx-auto px-4">
        <p className="font-heading text-3xl text-muted-foreground">EVENT NOT FOUND</p>
        <Link to="/events"><Button className="mt-4">BACK TO EVENTS</Button></Link>
      </div>
    );
  }

  const mainCard = fights.filter(f => f.is_main_event || f.is_title_fight);
  const undercard = fights.filter(f => !f.is_main_event && !f.is_title_fight);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/events">
        <Button variant="ghost" className="mb-6 font-display tracking-wider text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> ALL EVENTS
        </Button>
      </Link>

      {/* Event Header */}
      <div className="relative bg-card border border-border rounded-2xl overflow-hidden mb-8">
        {event.poster_url && (
          <div className="relative h-48 sm:h-64">
            <img src={event.poster_url} alt={event.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={`font-display text-xs tracking-wider ${
              event.status === "live" ? "border-green-500/30 text-green-400" :
              event.status === "upcoming" ? "border-blue-500/30 text-blue-400" :
              "border-muted-foreground/30 text-muted-foreground"
            }`}>
              {event.status?.toUpperCase()}
            </Badge>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl tracking-wide">{event.name?.toUpperCase()}</h1>
          {event.subtitle && <p className="text-lg text-muted-foreground mt-2">{event.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground font-display tracking-wider">
            {event.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
              </span>
            )}
            {event.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {event.venue}{event.city ? `, ${event.city}` : ""}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-2xl">{event.description}</p>
          )}
        </div>
 
