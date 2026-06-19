import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Swords, Trophy, Clock, CheckCircle2, XCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Challenges() {
  const [user, setUser] = useState(null);
  const [myFighter, setMyFighter] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // busca o fighter vinculado ao user
      base44.entities.Fighter.filter({ user_id: u.id }, "-created_date", 1).then(res => {
        if (res.length > 0) setMyFighter(res[0]);
      });
    }).catch(() => {});
  }, []);

  const { data: fighters = [] } = useQuery({
    queryKey: ["fighters-all"],
    queryFn: () => base44.entities.Fighter.list("-ranking_points", 100),
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-created_date", 50),
  });

  const sendChallenge = useMutation({
    mutationFn: () => base44.entities.Challenge.create({
      challenger_id: myFighter.id,
      challenger_name: myFighter.name,
      opponent_id: selectedOpponent.id,
      opponent_name: selectedOpponent.name,
      weight_class: myFighter.weight_class,
      message: message,
      status: "pending",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      setSelectedOpponent(null);
      setMessage("");
      toast.success("Desafio enviado!");
    },
  });

  const respondChallenge = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Challenge.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Resposta enviada!");
    },
  });

  const statusInfo = {
    pending: { label: "AGUARDANDO", color: "border-yellow-500/40 text-yellow-400", icon: Clock },
    accepted: { label: "ACEITO", color: "border-green-500/40 text-green-400", icon: CheckCircle2 },
    declined: { label: "RECUSADO", color: "border-red-500/40 text-red-400", icon: XCircle },
    matched: { label: "CONFIRMADO", color: "border-primary/40 text-primary", icon: Swords },
  };

  // Filtra os oponentes: não pode desafiar a si mesmo
  const opponents = fighters.filter(f => f.id !== myFighter?.id);

  // Separa challenges recebidos e enviados
  const received = challenges.filter(c => c.opponent_id === myFighter?.id);
  const sent = challenges.filter(c => c.challenger_id === myFighter?.id);

  if (!myFighter) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h2 className="font-heading text-4xl tracking-wide mb-3">ACESSO RESTRITO</h2>
        <p className="text-muted-foreground font-display tracking-wider text-sm">
          Apenas lutadores cadastrados podem acessar a área de desafios.<br />
          Crie seu perfil de lutador na página <span className="text-primary">PERFIL</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-5xl sm:text-6xl tracking-wide text-foreground flex items-center gap-4">
          <Swords className="w-10 h-10 text-primary" />
          DESAFIOS
        </h1>
        <p className="text-muted-foreground font-display text-sm tracking-wider mt-2">
          ZONA EXCLUSIVA DE LUTADORES
        </p>
      </div>

      {/* Meu perfil rápido */}
      <div className="bg-card border border-secondary/30 rounded-xl p-5 mb-10 flex items-center gap-4 glow-gold">
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center ring-2 ring-secondary/50">
          {myFighter.photo_url ? (
            <img src={myFighter.photo_url} alt={myFighter.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="font-heading text-2xl text-foreground">{myFighter.name?.charAt(0)}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            {myFighter.is_champion && <Trophy className="w-4 h-4 text-secondary" />}
            <span className="font-heading text-2xl tracking-wide">{myFighter.name?.toUpperCase()}</span>
          </div>
          <p className="text-xs font-display tracking-wider text-muted-foreground">
            {myFighter.wins}V {myFighter.losses}D — {myFighter.weight_class?.toUpperCase()}
            {myFighter.is_champion && <span className="ml-2 text-secondary">● CAMPEÃO</span>}
          </p>
        </div>
      </div>

      {/* Enviar desafio */}
      <div className="bg-card border border-border rounded-xl p-6 mb-10">
        <h2 className="font-heading text-2xl tracking-wide mb-5 flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" /> DESAFIAR LUTADOR
        </h2>

        {selectedOpponent ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="font-heading text-lg">{selectedOpponent.name?.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {selectedOpponent.is_champion && <Trophy className="w-3 h-3 text-secondary" />}
                  <p className="font-heading text-lg tracking-wide">{selectedOpponent.name?.toUpperCase()}</p>
                </div>
                <p className="text-xs text-muted-foreground">{selectedOpponent.wins}V {selectedOpponent.losses}D</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelectedOpponent(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            <textarea
              className="w-full bg-muted border border-border rounded-lg p-3 text-sm text-foreground font-body resize-none focus:outline-none focus:border-primary"
              rows={3}
              placeholder="Mensagem de desafio (opcional)..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 font-display tracking-wider"
                onClick={() => sendChallenge.mutate()}
                disabled={sendChallenge.isPending}
              >
                {sendChallenge.isPending ? "ENVIANDO..." : "CONFIRMAR DESAFIO"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedOpponent(null)}>CANCELAR</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opponents.map(f => (
              <motion.button
                key={f.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedOpponent(f)}
                className="flex items-center gap-3 bg-muted border border-border rounded-lg p-3 hover:border-primary/50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  {f.photo_url ? (
                    <img src={f.photo_url} alt={f.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="font-heading text-sm">{f.name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {f.is_champion && <Trophy className="w-3 h-3 text-secondary flex-shrink-0" />}
                    <p className="font-heading text-sm tracking-wide truncate">{f.name?.toUpperCase()}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.wins}V {f.losses}D — {f.fighting_style}</p>
                </div>
                <Swords className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Desafios recebidos */}
      {received.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-2xl tracking-wide mb-4 text-primary">DESAFIOS RECEBIDOS</h2>
          <div className="space-y-3">
            {received.map(c => {
              const info = statusInfo[c.status] || statusInfo.pending;
              const Icon = info.icon;
              return (
                <div key={c.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-heading text-lg tracking-wide">{c.challenger_name?.toUpperCase()}</p>
                      {c.message && <p className="text-sm text-muted-foreground mt-1">"{c.message}"</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`font-display text-xs tracking-wider ${info.color}`}>
                        <Icon className="w-3 h-3 mr-1" />{info.label}
                      </Badge>
                      {c.status === "pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 font-display text-xs tracking-wider"
                            onClick={() => respondChallenge.mutate({ id: c.id, status: "accepted" })}>
                            ACEITAR
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-display text-xs tracking-wider"
                            onClick={() => respondChallenge.mutate({ id: c.id, status: "declined" })}>
                            RECUSAR
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Desafios enviados */}
      {sent.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl tracking-wide mb-4 text-muted-foreground">DESAFIOS ENVIADOS</h2>
          <div className="space-y-3">
            {sent.map(c => {
              const info = statusInfo[c.status] || statusInfo.pending;
              const Icon = info.icon;
              return (
                <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs font-display tracking-wider text-muted-foreground mb-1">PARA</p>
                    <p className="font-heading text-lg tracking-wide">{c.opponent_name?.toUpperCase()}</p>
                    {c.message && <p className="text-sm text-muted-foreground mt-1">"{c.message}"</p>}
                  </div>
                  <Badge variant="outline" className={`font-display text-xs tracking-wider ${info.color}`}>
                    <Icon className="w-3 h-3 mr-1" />{info.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {received.length === 0 && sent.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Swords className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-display tracking-wider text-sm">NENHUM DESAFIO AINDA</p>
        </div>
      )}
    </div>
  );
}
