import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FighterCard from "@/components/fighters/FighterCard";
import { WEIGHT_CLASSES } from "@/lib/weightClasses";

export default function Fighters() {
  const [search, setSearch] = useState("");
  const [weightFilter, setWeightFilter] = useState("all");

  const { data: fighters = [], isLoading } = useQuery({
    queryKey: ["fighters"],
    queryFn: () => base44.entities.Fighter.list("-ranking_points", 100),
  });

  const filtered = fighters.filter(f => {
    const matchSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase()) || f.nickname?.toLowerCase().includes(search.toLowerCase());
    const matchWeight = weightFilter === "all" || f.weight_class === weightFilter;
    return matchSearch && matchWeight;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-5xl sm:text-6xl tracking-wide text-foreground flex items-center gap-4">
          <Users className="w-10 h-10 text-primary" />
          FIGHTERS
        </h1>
        <p className="text-muted-foreground font-display text-sm tracking-wider mt-2">
          {fighters.length} ACTIVE ATHLETES
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search fighters..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-border font-body"
          />
        </div>
        <Select value={weightFilter} onValueChange={setWeightFilter}>
          <SelectTrigger className="w-full sm:w-56 bg-card border-border">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Weight Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {WEIGHT_CLASSES.map(wc => (
              <SelectItem key={wc.id} value={wc.id}>{wc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-heading text-2xl text-muted-foreground">NO FIGHTERS FOUND</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((fighter, i) => (
            <FighterCard key={fighter.id} fighter={fighter} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
