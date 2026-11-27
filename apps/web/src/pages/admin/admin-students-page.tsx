import { useMemo, useState } from 'react'
import { Download, Search, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { useAdminStudents } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { cn, formatNumber, initials } from '@/lib/utils'

export function AdminStudentsPage() {
  const { data: students, isLoading } = useAdminStudents()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const list = useMemo(
    () =>
      (students ?? []).filter(
        (student) =>
          (status === 'all' || student.status === status) &&
          `${student.name} ${student.email} ${student.program}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [students, search, status],
  )

  return (
    <div>
      <PageHeader
        kicker="Communauté apprenante"
        title="Étudiants"
        description="Les comptes proviennent de l’annuaire institutionnel. Les données affichées sont celles nécessaires au suivi pédagogique."
        actions={
          <Button variant="outline" onClick={() => toast('Export généré', { description: 'Le fichier CSV sera disponible dans les downloads de l’instance.', kind: 'info' })}>
            <Download className="h-4 w-4" /> Exporter
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un étudiant…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[170px]" aria-label="Filtrer par statut">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="Actif">Actifs</SelectItem>
            <SelectItem value="En attente">En attente</SelectItem>
            <SelectItem value="Inactif">Inactifs</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="primary">{list.length} étudiants</Badge>
      </div>

      <div className="panel overflow-hidden">
        <div className="hidden grid-cols-[2fr_1.4fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-fg-subtle lg:grid">
          <span>Étudiant</span>
          <span>Programme</span>
          <span>XP / Niveau</span>
          <span>Statut</span>
          <span className="w-24" />
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {list.map((student) => (
              <div key={student.id} className="grid grid-cols-1 gap-2 px-5 py-3.5 lg:grid-cols-[2fr_1.4fr_1fr_1fr_auto] lg:items-center lg:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-[12px] font-bold text-white">
                    {initials(student.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-fg">{student.name}</p>
                    <p className="truncate text-[11.5px] text-fg-subtle">{student.email}</p>
                  </div>
                </div>

                <span className="truncate text-[12.5px] text-fg-muted">{student.program}</span>

                <div className="flex items-center gap-2">
                  <span className="font-display text-[15px] font-bold text-primary tabular-nums">{formatNumber(student.xp)}</span>
                  <span className="text-[11.5px] text-fg-subtle">· niv. {student.level}</span>
                </div>

                <span
                  className={cn(
                    'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    student.status === 'Actif' && 'bg-success-soft text-success',
                    student.status === 'En attente' && 'bg-warning-soft text-warning',
                    student.status === 'Inactif' && 'bg-surface-3 text-fg-subtle',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      student.status === 'Actif' && 'bg-success',
                      student.status === 'En attente' && 'bg-warning',
                      student.status === 'Inactif' && 'bg-fg-subtle',
                    )}
                  />
                  {student.status}
                </span>

                <div className="flex justify-self-end gap-1.5">
                  <Button variant="ghost" size="icon-sm" aria-label="Voir la fiche">
                    <UserCheck className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Rôles et permissions">
                    <ShieldCheck className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="mt-5 panel flex items-start gap-3 p-5">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-[12.5px] leading-relaxed text-fg-muted">
          L’accès aux données nominatives est réservé aux rôles habilités et fait l’objet d’un journal d’audit. Les
          analyses par cohorte sont agrégées et ne permettent pas de réindividualiser un étudiant.
        </p>
      </section>
    </div>
  )
}
