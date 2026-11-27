import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Coins,
  Eye,
  EyeOff,
  Flame,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Trophy,
  User,
  Zap,
} from 'lucide-react'
import { useLedger, useMe, useUpdateProfile } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LevelRing } from '@/components/shared/level-ring'
import { useToast } from '@/components/ui/toast'
import { useTheme } from '@/lib/theme'
import { TRACK_LABEL, cn, formatDateTime, formatNumber, initials } from '@/lib/utils'
import { useStudentIdentity } from '@/lib/student-identity'

const PROFILE_AVATARS = [
  ['forge-celeste.png', 'Forge Céleste'],
  ['forge-cyber.png', 'Forge Cyber'],
  ['forge-etoile.png', 'Forge Étoile'],
  ['forge-flow.png', 'Forge Flow'],
  ['forge-gamer.png', 'Forge Gamer'],
  ['forge-menthe.png', 'Forge Menthe'],
  ['forge-neko.png', 'Forge Neko'],
  ['forge-robo.png', 'Forge Robo'],
  ['forge-spectre.png', 'Forge Spectre'],
  ['forge-studieuse.png', 'Forge Studieuse'],
].map(([file, label]) => ({ src: `/avatars/launch/${file}`, label }))

export function ProfilePage() {
  const { data: me, isLoading } = useMe()
  const { data: ledger } = useLedger()
  const update = useUpdateProfile()
  const { theme, setPreference } = useTheme()
  const { toast } = useToast()
  const { identity, setIdentity } = useStudentIdentity()

  const [pseudonym, setPseudonym] = useState('')
  const [goal, setGoal] = useState('')
  const [identityForm, setIdentityForm] = useState(identity)

  if (isLoading || !me) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-52" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  const levelSpan = me.levelCeiling - me.levelFloor
  const levelProgress = levelSpan > 0 ? Math.round(((me.xp - me.levelFloor) / levelSpan) * 100) : 100
  const profileName = identityForm.nickname || pseudonym || identity.nickname || me.pseudonym || me.displayName

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Compte"
        title="Profil & préférences"
        description="Gérez votre identité publique, votre visibilité dans les classements et consultez votre journal de gains."
      />

      <section className="panel overflow-hidden">
        <div className="relative bg-brand-gradient px-5 py-6 sm:px-7">
          <div className="art-grid absolute inset-0 opacity-15" />
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/15 font-display text-[26px] font-bold text-white backdrop-blur-sm">
              {identity.avatar ? <img src={identity.avatar} alt="Avatar" className="h-full w-full rounded-3xl object-cover" /> : initials(profileName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-[24px] font-bold leading-tight text-white">{profileName}</h2>
                <Badge variant="cyan" className="gap-1 bg-white/15 text-white">
                  <Trophy className="h-3 w-3" /> Niveau {me.level}
                </Badge>
                {me.pseudonymized && (
                  <Badge variant="accent" className="gap-1 bg-white/15 text-white">
                    <EyeOff className="h-3 w-3" /> Pseudonymisé
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-[13px] text-white/80">
                {me.program} · {me.cohort} · {me.studentCode}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-[12px] text-white/70">
                <Mail className="h-3.5 w-3.5" /> {me.email}
              </p>
              {identity.bio && <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-white/80">{identity.bio}</p>}
              {identity.quote && <p className="mt-1 max-w-xl text-[12px] italic text-white/70">« {identity.quote} »</p>}
            </div>
            <div className="shrink-0">
              <LevelRing value={levelProgress} size={104} label={me.level} caption={me.levelTitle} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          {[
            { label: 'XP total', value: formatNumber(me.xp), icon: Zap },
            { label: 'Niveau', value: `${me.level} · ${me.levelTitle}`, icon: Trophy },
            { label: 'Quêtes', value: String(me.questsCompleted), icon: BadgeCheck },
            { label: 'Badges', value: String(me.badgesEarned), icon: BadgeCheck },
            { label: 'Germes', value: formatNumber(me.germs), icon: Coins },
            { label: 'Série', value: `${me.streakDays} jours`, icon: Flame },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-fg-subtle">{stat.label}</p>
              <p className="mt-1 font-display text-[19px] font-bold leading-none text-fg">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <Tabs defaultValue="identite">
        <TabsList>
          <TabsTrigger value="identite">Identité</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="journal">Journal des gains</TabsTrigger>
          <TabsTrigger value="voies">Mes voies</TabsTrigger>
        </TabsList>

        <TabsContent value="identite">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="panel p-5">
              <p className="kicker">Identité publique</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                  <Camera className="h-4 w-4 shrink-0 text-primary" />
                  <div><p className="text-[13px] font-semibold text-fg">Personnaliser ma carte</p><p className="text-[11px] text-fg-subtle">Avatar, biographie et citation visibles sur ton profil.</p></div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-nickname">Nom affiché</Label>
                  <Input id="profile-nickname" maxLength={32} value={identityForm.nickname} onChange={(e) => setIdentityForm({ ...identityForm, nickname: e.target.value })} placeholder={me.displayName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-bio">Biographie</Label>
                  <Textarea id="profile-bio" rows={3} maxLength={240} value={identityForm.bio} onChange={(e) => setIdentityForm({ ...identityForm, bio: e.target.value })} placeholder="Ton parcours, tes domaines d’expertise…" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-quote">Citation personnelle</Label>
                  <Textarea id="profile-quote" rows={2} maxLength={160} value={identityForm.quote} onChange={(e) => setIdentityForm({ ...identityForm, quote: e.target.value })} placeholder="Une phrase qui te représente…" />
                </div>
                <div className="space-y-2">
                  <Label>Choisir un avatar</Label>
                  <div className="flex flex-wrap gap-2">
                    {PROFILE_AVATARS.map((option) => <button key={option.src} type="button" title={option.label} onClick={() => setIdentityForm({ ...identityForm, avatar: option.src })} className={cn('relative rounded-xl border p-1 transition', identityForm.avatar === option.src ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50')} aria-pressed={identityForm.avatar === option.src}><img src={option.src} alt={option.label} className="h-12 w-12 rounded-lg object-cover" />{identityForm.avatar === option.src && <CheckCircle2 className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-primary text-white" />}</button>)}
                  </div>
                  <p className="text-[11px] text-fg-subtle">10 avatars sont disponibles au lancement. De nouveaux avatars pourront être débloqués dans la boutique avec tes XP.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pseudo">Pseudonyme</Label>
                  <Input
                    id="pseudo"
                    value={pseudonym || me.pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    placeholder="Visible dans La Forge et le classement"
                  />
                  <p className="text-[11.5px] text-fg-subtle">
                    Votre nom complet n’est jamais affiché publiquement. Le pseudonyme l’est, sauf si vous activez la
                    pseudonymisation complète.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mail">Adresse de contact</Label>
                  <Input id="mail" defaultValue={me.email} disabled />
                  <p className="text-[11.5px] text-fg-subtle">
                    L’adresse institutionnelle est gérée par l’API UCA et n’est pas modifiable ici.
                  </p>
                </div>
                <Button
                  onClick={() =>
                    update.mutate(
                      { pseudonym: pseudonym || identityForm.nickname || me.pseudonym, weeklyGoalXp: Number(goal) || me.weeklyGoalXp },
                      { onSuccess: () => { setIdentity({ ...identityForm, nickname: identityForm.nickname || pseudonym }); toast('Profil personnalisé enregistré') } },
                    )
                  }
                  loading={update.isPending}
                >
                  <Save className="h-4 w-4" /> Enregistrer
                </Button>
              </div>
            </section>

            <section className="panel p-5">
              <p className="kicker">Confidentialité</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-2 p-4">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-fg">Figurer dans le classement</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                      Votre score reste compté même si vous n’apparaissez pas. Seuls les participants ayant accepté
                      sont visibles.
                    </p>
                  </div>
                  <Switch
                    checked={me.competitionOptIn}
                    onCheckedChange={(checked) =>
                      update.mutate({ competitionOptIn: checked }, { onSuccess: () => toast(checked ? 'Vous figurez au classement' : 'Vous avez quitté le classement', { kind: 'info' }) })
                    }
                    aria-label="Figurer dans le classement"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-2 p-4">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-fg">Pseudonymisation complète</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                      Masque votre profil dans les espaces publics, y compris votre voie et votre programme.
                    </p>
                  </div>
                  <Switch
                    checked={me.pseudonymized}
                    onCheckedChange={(checked) =>
                      update.mutate(
                        { pseudonym: checked ? me.pseudonym : me.pseudonym },
                        { onSuccess: () => toast('Préférence enregistrée', { kind: 'info' }) },
                      )
                    }
                    aria-label="Pseudonymisation"
                  />
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-primary">
                    Aucun classement ne peut exposer une donnée n’appartenant pas à une personne ayant accepté la
                    compétition. Cette règle est appliquée côté serveur, pas seulement dans l’interface.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="panel p-5">
              <p className="kicker">Objectif hebdomadaire</p>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Objectif XP par semaine</Label>
                  <Input
                    id="goal"
                    type="number"
                    min={0}
                    step={100}
                    defaultValue={me.weeklyGoalXp}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[12px] font-semibold">
                    <span className="text-fg-muted">Progression hebdomadaire</span>
                    <span className="text-primary">{formatNumber(me.weeklyXp)} / {formatNumber(me.weeklyGoalXp)} XP</span>
                  </div>
                  <Progress value={Math.min(100, Math.round((me.weeklyXp / me.weeklyGoalXp) * 100))} />
                </div>
                <Button
                  onClick={() =>
                    update.mutate(
                      { weeklyGoalXp: Number(goal) || me.weeklyGoalXp },
                      { onSuccess: () => toast('Objectif mis à jour') },
                    )
                  }
                  loading={update.isPending}
                >
                  <Save className="h-4 w-4" /> Enregistrer l’objectif
                </Button>
              </div>
            </section>

            <section className="panel p-5">
              <p className="kicker">Apparence</p>
              <div className="mt-4 space-y-2">
                {[
                  { key: 'light', label: 'Clair', desc: 'Espaces pédagogiques : quêtes, parcours, badges, profil.', icon: Eye },
                  { key: 'dark', label: 'Sombre', desc: 'Arène et compétitions, ambiance game.', icon: Lock },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setPreference(option.key as 'light' | 'dark')}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                      theme === option.key ? 'border-primary/40 bg-primary-soft' : 'border-border bg-surface-2 hover:border-border-strong',
                    )}
                  >
                    <option.icon className={cn('mt-0.5 h-4 w-4 shrink-0', theme === option.key ? 'text-primary' : 'text-fg-subtle')} />
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-semibold text-fg">{option.label}</span>
                      <span className="mt-0.5 block text-[12px] text-fg-muted">{option.desc}</span>
                    </span>
                  </button>
                ))}
                <p className="pt-1 text-[11.5px] text-fg-subtle">
                  Sans choix explicite, le thème suit l’espace : clair pour le pédagogique, sombre pour les compétitions.
                </p>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="journal">
          <section className="panel overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <p className="kicker">Ledger XP</p>
              <h3 className="mt-1 font-display text-[17px] font-bold text-fg">Historique de vos gains</h3>
              <p className="mt-1 text-[12px] text-fg-muted">
                Journal en ajout seul : chaque gain est tracé et ne peut être attribué deux fois pour la même source.
              </p>
            </div>
            <div className="divide-y divide-border">
              {(ledger ?? []).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                      entry.xpDelta > 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
                    )}
                  >
                    {entry.xpDelta > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-fg">{entry.label}</p>
                    <p className="text-[11.5px] text-fg-subtle">
                      {entry.sourceEvent}
                      {entry.trackType ? ` · voie ${TRACK_LABEL[entry.trackType]}` : ''} · règle v{entry.ruleVersion}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn('font-display text-[15px] font-bold tabular-nums', entry.xpDelta > 0 ? 'text-success' : 'text-danger')}>
                      {entry.xpDelta > 0 ? '+' : ''}{entry.xpDelta}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-fg-subtle">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="voies">
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(me.trackPoints).map(([code, points]) => (
              <section key={code} className="panel p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-[16px] font-bold text-fg">{TRACK_LABEL[code]}</p>
                  {code === me.dominantTrack && <Badge variant="accent">Voie dominante</Badge>}
                </div>
                <p className="mt-2 font-display text-[26px] font-bold leading-none text-primary">{formatNumber(points)}</p>
                <p className="mt-1 text-[12px] text-fg-subtle">points accumulés</p>
              </section>
            ))}
            <section className="panel flex flex-col items-center justify-center gap-2 p-5 text-center">
              <User className="h-6 w-6 text-fg-subtle" />
              <p className="text-[13px] font-semibold text-fg">Voie dominante sur 30 jours</p>
              <p className="text-[12px] text-fg-muted">
                Calculée côté serveur à partir du journal, sur les 30 derniers jours.
              </p>
              <p className="text-[11.5px] text-fg-subtle">Dernière mise à jour : {formatDateTime(new Date().toISOString())}</p>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
