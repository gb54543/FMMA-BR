import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Calendar, Swords, Trophy, Plus, Save, CheckCircle, X, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { WEIGHT_CLASSES, getWeightClassName } from "@/lib/weightClasses";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: fighters = [] } = useQuery({
    queryKey: ["fighters"],
    queryFn: () => base44.entities.Fighter.list("-ranking_points"),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => base44.entities.Event.list("-date"),
  });

  const { data: fights = [] } = useQuery({
    queryKey: ["fights"],
    queryFn: () => base44.entities.Fight.list("-created_date"),
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges-all"],
    queryFn: () => base44.entities.Challenge.list("-created_date", 50),
  });

  if (user?.role !== "admin" && user?.role !== "organizer") {
    return (
      <div className="text-center py-20 max-w-7xl mx-auto px-4">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="font-heading text-3xl text-muted-foreground">ACESSO NEGADO</p>
        <p className="text-sm text-muted-foreground mt-2">Apenas organizadores e admins podem acessar este painel.</p>
      </div>
    );
  }

  const pendingChallenges = challenges.filter(c => c.status === "pending");

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-5xl tracking-wide text-foreground flex items-center gap-4">
          <Shield className="w-10 h-10 text-secondary" />
          PAINEL ADMIN
        </h1>
        <p className="text-muted-foreground font-display text-sm tracking-wider mt-2">GERENCIAR LUTADORES, EVENTOS, LUTAS E RESULTADOS</p>
      </div>

      <Tabs defaultValue="fighters">
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="fighters" className="font-display tracking-wider text-xs">LUTADORES</TabsTrigger>
          <TabsTrigger value="events" className="font-display tracking-wider text-xs">EVENTOS</TabsTrigger>
          <TabsTrigger value="fights" className="font-display tracking-wider text-xs">LUTAS</TabsTrigger>
          <TabsTrigger value="results" className="font-display tracking-wider text-xs">RESULTADOS</TabsTrigger>
          <TabsTrigger value="champions" className="font-display tracking-wider text-xs">CINTURÃO</TabsTrigger>
          <TabsTrigger value="challenges" className="font-display tracking-wider text-xs">
            DESAFIOS {pendingChallenges.length > 0 && <Badge className="ml-1 bg-primary text-xs">{pendingChallenges.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fighters">
          <FightersTab fighters={fighters} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="events">
          <EventsTab events={events} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="fights">
          <FightsTab events={events} fighters={fighters} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="results">
          <ResultsTab fights={fights} fighters={fighters} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="champions">
          <ChampionsTab fighters={fighters} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="challenges">
          <ChallengesTab challenges={challenges} queryClient={queryClient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FightersTab({ fighters, queryClient }) {
  const emptyForm = { name: "", nickname: "", nationality: "Brasil", age: "", height_cm: "", weight_kg: "", reach_cm: "", weight_class: "middleweight", fighting_style: "", gym: "", bio: "", status: "active" };
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        age: data.age ? Number(data.age) : undefined,
        height_cm: data.height_cm ? Number(data.height_cm) : undefined,
        weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
        reach_cm: data.reach_cm ? Number(data.reach_cm) : undefined,
      };
      return editId
        ? base44.entities.Fighter.update(editId, payload)
        : base44.entities.Fighter.create({ ...payload, wins: 0, losses: 0, draws: 0, ko_wins: 0, sub_wins: 0, dec_wins: 0, win_streak: 0, is_champion: false, ranking_points: 0 });
    },
    onSuccess: () => {
      toast.success(editId ? "Lutador atualizado!" : "Lutador criado!");
      queryClient.invalidateQueries({ queryKey: ["fighters"] });
      setOpen(false);
      setForm(emptyForm);
      setEditId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Fighter.delete(id),
    onSuccess: () => {
      toast.success("Lutador removido!");
      queryClient.invalidateQueries({ queryKey: ["fighters"] });
    },
  });

  const openEdit = (f) => {
    setEditId(f.id);
    setForm({ name: f.name || "", nickname: f.nickname || "", nationality: f.nationality || "Brasil", age: f.age || "", height_cm: f.height_cm || "", weight_kg: f.weight_kg || "", reach_cm: f.reach_cm || "", weight_class: f.weight_class || "middleweight", fighting_style: f.fighting_style || "", gym: f.gym || "", bio: f.bio || "", status: f.status || "active" });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-2xl tracking-wide">GERENCIAR LUTADORES</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary font-display tracking-wider text-sm">
              <Plus className="w-4 h-4 mr-2" /> NOVO LUTADOR
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">{editId ? "EDITAR LUTADOR" : "CRIAR LUTADOR"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wider text-xs">NOME *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-muted border-border mt-1" required />
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">APELIDO</Label>
                  <Input value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="bg-muted border-border mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wider text-xs">ALTURA (m)</Label>
                  <Input type="number" step="0.01" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })} className="bg-muted border-border mt-1" placeholder="ex: 1.73" />
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">PESO (kg)</Label>
                  <Input type="number" step="0.01" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} className="bg-muted border-border mt-1" placeholder="ex: 55.95" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wider text-xs">ENVERGADURA (cm)</Label>
                  <Input type="number" value={form.reach_cm} onChange={e => setForm({ ...form, reach_cm: e.target.value })} className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">IDADE</Label>
                  <Input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className="bg-muted border-border mt-1" />
                </div>
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">ESTILO DE LUTA</Label>
                <Input value={form.fighting_style} onChange={e => setForm({ ...form, fighting_style: e.target.value })} className="bg-muted border-border mt-1" placeholder="ex: Jiu Jitsu, Muay Thai..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wider text-xs">DIVISÃO *</Label>
                  <Select value={form.weight_class} onValueChange={v => setForm({ ...form, weight_class: v })}>
                    <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEIGHT_CLASSES.map(wc => <SelectItem key={wc.id} value={wc.id}>{wc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">NACIONALIDADE</Label>
                  <Input value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} className="bg-muted border-border mt-1" />
                </div>
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">ACADEMIA / GYM</Label>
                <Input value={form.gym} onChange={e => setForm({ ...form, gym: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">BIO</Label>
                <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="bg-muted border-border mt-1" rows={3} />
              </div>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full bg-primary font-display tracking-wider">
                <Save className="w-4 h-4 mr-2" /> {editId ? "SALVAR ALTERAÇÕES" : "CRIAR LUTADOR"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {fighters.map(f => (
          <div key={f.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {f.is_champion && <span className="font-heading text-xl text-secondary">C</span>}
              <div>
                <p className="font-heading text-lg tracking-wide">{f.name?.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground font-display tracking-wider">
                  {getWeightClassName(f.weight_class)} {f.fighting_style && `• ${f.fighting_style}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(f)} className="font-display text-xs tracking-wider">EDITAR</Button>
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => deleteMutation.mutate(f.id)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsTab({ events, queryClient }) {
  const [form, setForm] = useState({ name: "", subtitle: "", date: "", venue: "", city: "", description: "" });
  const [open, setOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      toast.success("Evento criado!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
      setForm({ name: "", subtitle: "", date: "", venue: "", city: "", description: "" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Event.update(id, { status }),
    onSuccess: () => {
      toast.success("Evento atualizado!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      toast.success("Evento removido!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-2xl tracking-wide">GERENCIAR EVENTOS</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary font-display tracking-wider text-sm">
              <Plus className="w-4 h-4 mr-2" /> NOVO EVENTO
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">CRIAR EVENTO</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div>
                <Label className="font-display tracking-wider text-xs">NOME DO EVENTO *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-muted border-border mt-1" required />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">SUBTÍTULO</Label>
                <Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">DATA</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wider text-xs">LOCAL</Label>
                  <Input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">CIDADE</Label>
                  <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="bg-muted border-border mt-1" />
                </div>
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">DESCRIÇÃO</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-muted border-border mt-1" rows={3} />
              </div>
              <Button type="submit" className="w-full bg-primary font-display tracking-wider">
                <Save className="w-4 h-4 mr-2" /> CRIAR EVENTO
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-heading text-lg tracking-wide">{event.name?.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground font-display tracking-wider">
                {event.date ? new Date(event.date).toLocaleDateString("pt-BR") : "Data a definir"} {event.venue && `• ${event.venue}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={event.status} onValueChange={v => updateStatusMutation.mutate({ id: event.id, status: v })}>
                <SelectTrigger className="w-36 bg-muted border-border text-xs font-display tracking-wider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">A REALIZAR</SelectItem>
                  <SelectItem value="live">AO VIVO</SelectItem>
                  <SelectItem value="completed">CONCLUÍDO</SelectItem>
                  <SelectItem value="cancelled">CANCELADO</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => deleteMutation.mutate(event.id)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FightsTab({ events, fighters, queryClient }) {
  const [form, setForm] = useState({
    event_id: "", fighter1_id: "", fighter2_id: "", weight_class: "lightweight",
    is_title_fight: false, is_main_event: false, fight_order: 1,
  });
  const [open, setOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => {
      const f1 = fighters.find(f => f.id === data.fighter1_id);
      const f2 = fighters.find(f => f.id === data.fighter2_id);
      return base44.entities.Fight.create({
        ...data,
        fighter1_name: f1?.name,
        fighter2_name: f2?.name,
        fight_order: Number(data.fight_order),
      });
    },
    onSuccess: () => {
      toast.success("Luta criada!");
      queryClient.invalidateQueries({ queryKey: ["fights"] });
      setOpen(false);
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-2xl tracking-wide">CRIAR LUTAS</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary font-display tracking-wider text-sm">
              <Plus className="w-4 h-4 mr-2" /> NOVA LUTA
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">CRIAR LUTA</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div>
                <Label className="font-display tracking-wider text-xs">EVENTO *</Label>
                <Select value={form.event_id} onValueChange={v => setForm({ ...form, event_id: v })}>
                  <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecionar evento" /></SelectTrigger>
                  <SelectContent>
                    {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-display tracking-wider text-xs">LUTADOR 1 *</Label>
                  <Select value={form.fighter1_id} onValueChange={v => setForm({ ...form, fighter1_id: v })}>
                    <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      {fighters.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">LUTADOR 2 *</Label>
                  <Select value={form.fighter2_id} onValueChange={v => setForm({ ...form, fighter2_id: v })}>
                    <SelectTrigger className="bg-muted border-border mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      {fighters.filter(f => f.id !== form.fighter1_id).map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">DIVISÃO</Label>
                <Select value={form.weight_class} onValueChange={v => setForm({ ...form, weight_class: v })}>
                  <SelectTrigger className="bg-muted border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEIGHT_CLASSES.map(wc => <SelectItem key={wc.id} value={wc.id}>{wc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-display tracking-wider text-xs">ORDEM NA CARD</Label>
                <Input type="number" value={form.fight_order} onChange={e => setForm({ ...form, fight_order: e.target.value })} className="bg-muted border-border mt-1" />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_title_fight} onCheckedChange={v => setForm({ ...form, is_title_fight: v })} />
                  <Label className="font-display tracking-wider text-xs">LUTA DE CINTURÃO</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_main_event} onCheckedChange={v => setForm({ ...form, is_main_event: v })} />
                  <Label className="font-display tracking-wider text-xs">LUTA PRINCIPAL</Label>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary font-display tracking-wider">
                <Save className="w-4 h-4 mr-2" /> CRIAR LUTA
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ResultsTab({ fights, fighters, queryClient }) {
  const scheduledFights = fights.filter(f => f.status === "scheduled" || f.status === "in_progress");
  const [resultForm, setResultForm] = useState({});

  const recordResultMutation = useMutation({
    mutationFn: async ({ fightId, data }) => {
      await base44.entities.Fight.update(fightId, {
        ...data,
        status: "completed",
        round: data.round ? Number(data.round) : undefined,
      });

      const fight = fights.find(f => f.id === fightId);
      const winnerId = data.winner_id;
      const loserId = fight.fighter1_id === winnerId ? fight.fighter2_id : fight.fighter1_id;
      const winner = fighters.find(f => f.id === winnerId);
      const loser = fighters.find(f => f.id === loserId);

      if (winner) {
        const updateData = {
          wins: (winner.wins || 0) + 1,
          win_streak: (winner.win_streak || 0) + 1,
          ranking_points: (winner.ranking_points || 0) + 100,
        };
        if (data.method === "KO/TKO") updateData.ko_wins = (winner.ko_wins || 0) + 1;
        else if (data.method === "Submission") updateData.sub_wins = (winner.sub_wins || 0) + 1;
        else if (data.method?.includes("Decision")) updateData.dec_wins = (winner.dec_wins || 0) + 1;

        if (fight.is_title_fight && loser?.is_champion) {
          updateData.is_champion = true;
          await base44.entities.Fighter.update(loserId, { is_champion: false });
        }
        await base44.entities.Fighter.update(winnerId, updateData);
      }
      if (loser) {
        await base44.entities.Fighter.update(loserId, {
          losses: (loser.losses || 0) + 1,
          win_streak: 0,
          ranking_points: Math.max((loser.ranking_points || 0) - 50, 0),
        });
      }
    },
    onSuccess: () => {
      toast.success("Resultado registrado! Registros dos lutadores atualizados.");
      queryClient.invalidateQueries({ queryKey: ["fights"] });
      queryClient.invalidateQueries({ queryKey: ["fighters"] });
      setResultForm({});
    },
  });

  return (
    <div>
      <h2 className="font-heading text-2xl tracking-wide mb-6">REGISTRAR RESULTADOS</h2>
      {scheduledFights.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">Nenhuma luta pendente para registrar.</p>
      ) : (
        <div className="space-y-4">
          {scheduledFights.map(fight => (
            <div key={fight.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-heading text-lg tracking-wide">
                  {fight.fighter1_name?.toUpperCase()} vs {fight.fighter2_name?.toUpperCase()}
                </p>
                <Badge variant="outline" className="font-display text-xs tracking-wider">
                  {getWeightClassName(fight.weight_class)?.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="font-display tracking-wider text-xs">VENCEDOR</Label>
                  <Select value={resultForm[fight.id]?.winner_id || ""} onValueChange={v => setResultForm({ ...resultForm, [fight.id]: { ...resultForm[fight.id], winner_id: v } })}>
                    <SelectTrigger className="bg-muted border-border mt-1 text-xs"><SelectValue placeholder="Selecionar vencedor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={fight.fighter1_id}>{fight.fighter1_name}</SelectItem>
                      <SelectItem value={fight.fighter2_id}>{fight.fighter2_name}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">MÉTODO</Label>
                  <Select value={resultForm[fight.id]?.method || ""} onValueChange={v => setResultForm({ ...resultForm, [fight.id]: { ...resultForm[fight.id], method: v } })}>
                    <SelectTrigger className="bg-muted border-border mt-1 text-xs"><SelectValue placeholder="Método" /></SelectTrigger>
                    <SelectContent>
                      {["KO/TKO", "Submission", "Decisão Unânime", "Decisão Dividida", "Decisão por Maioria", "DQ"].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">ROUND</Label>
                  <Input type="number" min={1} max={5} value={resultForm[fight.id]?.round || ""} onChange={e => setResultForm({ ...resultForm, [fight.id]: { ...resultForm[fight.id], round: e.target.value } })} className="bg-muted border-border mt-1" />
                </div>
                <div>
                  <Label className="font-display tracking-wider text-xs">TEMPO</Label>
                  <Input placeholder="ex: 2:35" value={resultForm[fight.id]?.time || ""} onChange={e => setResultForm({ ...resultForm, [fight.id]: { ...resultForm[fight.id], time: e.target.value } })} className="bg-muted border-border mt-1" />
                </div>
              </div>
              <Button className="mt-4 bg-primary font-display tracking-wider text-sm" disabled={!resultForm[fight.id]?.winner_id || !resultForm[fight.id]?.method} onClick={() => recordResultMutation.mutate({ fightId: fight.id, data: resultForm[fight.id] })}>
                <CheckCircle className="w-4 h-4 mr-2" /> REGISTRAR RESULTADO
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChampionsTab({ fighters, queryClient }) {
  const toggleChampionMutation = useMutation({
    mutationFn: async ({ fighterId, isChampion, weightClass }) => {
      if (isChampion) {
        const currentChamp = fighters.find(f => f.is_champion && f.weight_class === weightClass && f.id !== fighterId);
        if (currentChamp) {
          await base44.entities.Fighter.update(currentChamp.id, { is_champion: false });
        }
      }
      await base44.entities.Fighter.update(fighterId, { is_champion: isChampion });
    },
    onSuccess: () => {
      toast.success("Campeão atualizado!");
      queryClient.invalidateQueries({ queryKey: ["fighters"] });
    },
  });

  return (
    <div>
      <h2 className="font-heading text-2xl tracking-wide mb-2">CINTURÃO — DEFINIR CAMPEÃO</h2>
      <p className="text-muted-foreground font-display text-xs tracking-wider mb-6">Selecione quem está com o cinturão em cada divisão.</p>
      {WEIGHT_CLASSES.map(wc => {
        const divFighters = fighters.filter(f => f.weight_class === wc.id);
        if (divFighters.length === 0) return null;
        const champ = divFighters.find(f => f.is_champion);
        return (
          <div key={wc.id} className="bg-card border border-border rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-lg tracking-wide">{wc.name.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">
                  {champ ? <span className="text-secondary">C — {champ.name}</span> : "Cinturão vago"}
                </p>
              </div>
              <Select
                value={champ?.id || "vacant"}
                onValueChange={v => {
                  if (v === "vacant" && champ) {
                    toggleChampionMutation.mutate({ fighterId: champ.id, isChampion: false, weightClass: wc.id });
                  } else if (v !== "vacant") {
                    toggleChampionMutation.mutate({ fighterId: v, isChampion: true, weightClass: wc.id });
                  }
                }}
              >
                <SelectTrigger className="w-48 bg-muted border-border text-xs font-display tracking-wider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">VAGO</SelectItem>
                  {divFighters.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChallengesTab({ challenges, queryClient }) {
  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Challenge.update(id, { status }),
    onSuccess: () => {
      toast.success("Desafio atualizado!");
      queryClient.invalidateQueries({ queryKey: ["challenges-all"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Challenge.delete(id),
    onSuccess: () => {
      toast.success("Desafio removido!");
      queryClient.invalidateQueries({ queryKey: ["challenges-all"] });
    },
  });

  const statusLabels = { pending: "AGUARDANDO", accepted: "ACEITO", declined: "RECUSADO", matched: "CONFIRMADO" };
  const statusColors = { pending: "text-yellow-400", accepted: "text-green-400", declined: "text-red-400", matched: "text-primary" };

  return (
    <div>
      <h2 className="font-heading text-2xl tracking-wide mb-6">GERENCIAR DESAFIOS</h2>
      {challenges.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">Nenhum desafio registrado.</p>
      ) : (
        <div className="space-y-3">
          {challenges.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-heading text-sm tracking-wide">
                    {c.challenger_name?.toUpperCase()} <span className="text-primary">→</span> {c.opponent_name?.toUpperCase()}
                  </p>
                  {c.message && <p className="text-xs text-muted-foreground mt-1">"{c.message}"</p>}
                  <p className={`text-xs font-display tracking-wider mt-1 ${statusColors[c.status]}`}>{statusLabels[c.status]}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {c.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 font-display text-xs tracking-wider" onClick={() => updateMutation.mutate({ id: c.id, status: "accepted" })}>ACEITAR</Button>
                      <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 font-display text-xs tracking-wider" onClick={() => updateMutation.mutate({ id: c.id, status: "declined" })}>RECUSAR</Button>
                    </>
                  )}
                  {c.status === "accepted" && (
                    <Button size="sm" className="bg-primary font-display text-xs tracking-wider" onClick={() => updateMutation.mutate({ id: c.id, status: "matched" })}>CONFIRMAR LUTA</Button>
                  )}
                  <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => deleteMutation.mutate(c.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
