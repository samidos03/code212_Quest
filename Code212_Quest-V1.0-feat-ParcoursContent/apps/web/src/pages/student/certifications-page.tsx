import { Award, Download, FileCheck2, ShieldAlert } from 'lucide-react'
import { useCertifications } from '@/hooks/use-api'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { TRACK_LABEL, cn, formatDate } from '@/lib/utils'

export function CertificationsPage() {
  const { data: certifications, isLoading } = useCertifications()
  const { toast } = useToast()

  const obtained = (certifications ?? []).filter((c) => c.status === 'obtenue')

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Compétences attestées"
        title="Certifications"
        description="Chaque certification résume un parcours validé par les formateurs. Les attestations sont lisibles et partageables par l’étudiant."
        actions={<Badge variant="accent">{obtained.length} obtenue(s)</Badge>}
      />

      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white sm:p-8">
        <div className="art-grid absolute inset-0 opacity-15" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Award className="h-7 w-7" />
            </span>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/75">Skills that speak</p>
              <h2 className="mt-1 font-display text-[24px] font-bold leading-tight sm:text-[30px]">
                Des compétences, pas seulement des points.
              </h2>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-white/80">
                Une certification Code212 atteste d’un parcours de quêtes validé, de critères d’évaluation documentés et
                d’une validation humaine par un formateur du centre.
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur-sm">
            <p className="font-display text-[34px] font-bold leading-none">{obtained.length}</p>
            <p className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/75">certifications</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(certifications ?? []).map((cert) => (
            <article key={cert.id} className="panel flex flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white',
                    cert.status === 'obtenue' && 'bg-gradient-to-br from-[#c5027f] to-[#6701e6]',
                    cert.status === 'en_cours' && 'bg-surface-3 text-fg-subtle',
                    cert.status === 'expiree' && 'bg-surface-3 text-fg-subtle',
                  )}
                >
                  {cert.status === 'obtenue' ? <FileCheck2 className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                </span>
                <Badge
                  variant={
                    cert.status === 'obtenue' ? 'success' : cert.status === 'en_cours' ? 'warning' : 'outline'
                  }
                >
                  {cert.status === 'obtenue' ? 'Obtenue' : cert.status === 'en_cours' ? 'En cours' : 'Expirée'}
                </Badge>
              </div>

              <h3 className="mt-3 font-display text-[19px] font-bold leading-tight text-fg">{cert.title}</h3>
              <p className="mt-0.5 text-[12.5px] text-fg-muted">{cert.issuer}</p>
              <p className="mt-1 text-[11.5px] text-fg-subtle">
                {TRACK_LABEL[cert.track]} · {cert.status === 'obtenue' ? `Délivrée le ${formatDate(cert.issuedAt)}` : `Progression ${cert.progress} %`}
              </p>

              <div className="mt-3.5">
                <Progress value={cert.progress} className="h-1.5" tone={cert.status === 'obtenue' ? 'success' : 'primary'} />
              </div>

              <ul className="mt-3.5 space-y-1.5">
                {cert.criteria.map((criterion) => (
                  <li key={criterion} className="flex items-start gap-2 text-[12.5px] text-fg-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {criterion}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {cert.skills.map((skill) => (
                  <span key={skill} className="chip">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
                  ID · {cert.code}
                </span>
                <Button
                  size="sm"
                  variant={cert.status === 'obtenue' ? 'outline' : 'ghost'}
                  onClick={() =>
                    toast(
                      cert.status === 'obtenue' ? 'Téléchargement bientôt disponible' : 'Certification en cours',
                      {
                        description:
                          cert.status === 'obtenue'
                            ? 'L’attestation signée et son identifiant Open Badges seront activés avec la mise en production du service de certification.'
                            : 'Terminez les critères pour valider cette certification.',
                        kind: 'info',
                      },
                    )
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                  {cert.status === 'obtenue' ? 'Télécharger' : 'Continuer'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="panel flex items-start gap-3 p-5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="text-[13px] font-semibold text-fg">Attestations non signées en environnement de démonstration</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
            Les identifiants affichés sont des références internes. La conformité Open Badges 3.0 (signature, DID émetteur,
            preuve et révocation) exige une infrastructure dédiée et une gouvernance de l’émetteur ; elle n’est pas
            activée dans cette version.
          </p>
        </div>
      </section>
    </div>
  )
}
