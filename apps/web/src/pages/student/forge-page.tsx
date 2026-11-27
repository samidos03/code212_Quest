import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Eye, Flag, Lock, MessageSquare, Pin, Plus, Search, Send, ShieldCheck } from 'lucide-react'
import { useCreateThread, useForgeCategories, useForgeThreads, useReplyToThread } from '@/hooks/use-api'
import { useAuth } from '@/lib/auth'
import { ForgeReportDialog } from '@/components/forge/report-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { cn, formatRelative, initials } from '@/lib/utils'
import type { ForgeCategorySlug, ForgeThread } from '@/types'

const QUESTION_TEMPLATE = 'Contexte :\n\nCode ou extrait :\n\nRésultat attendu / obtenu :\n\nDéjà essayé :\n'

function authorColor(thread: ForgeThread) {
  const identity = thread.author
  if (identity?.moderationStatus === 'banned') return 'text-fg-subtle line-through'
  if (identity?.isDirector || identity?.communityRoles?.includes('director')) return 'text-amber-400'
  const level = identity?.level
  if (level === undefined) return 'text-fg'
  return level >= 5 ? 'text-amber-400' : level === 4 ? 'text-violet-400' : level === 3 ? 'text-cyan-400' : level === 2 ? 'text-emerald-400' : 'text-slate-400'
}

function ForgeDiscussionCard({ thread, onReply, onReport }: { thread: ForgeThread; onReply: (thread: ForgeThread) => void; onReport: (thread: ForgeThread) => void }) {
  const created = new Date(thread.createdAt)
  const dateTitle = Number.isNaN(created.getTime()) ? undefined : created.toLocaleString('fr-FR')
  const popular = thread.views >= 100
  return <article className={cn('rounded-xl border border-white/10 bg-surface/90 px-4 py-3 shadow-[0_8px_26px_rgba(0,0,0,.07)] backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:shadow-[0_0_22px_rgba(34,211,238,.10)] sm:px-5', thread.closed && 'opacity-75')}>
    {thread.pinned && <div className="mb-2"><Badge variant="accent"><Pin className="mr-1 h-3 w-3" />Épinglée</Badge></div>}
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-3 text-xs font-bold text-fg-muted sm:h-11 sm:w-11">
        {thread.author?.avatarUrl ? <img src={thread.author.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(thread.authorPseudonym)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
          <Link to={`/forge/${thread.id}`} className="min-w-0 flex-1 basis-64 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            <h2 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-fg hover:text-primary sm:text-[16px]">{thread.title}</h2>
          </Link>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {thread.solved && <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Résolue</Badge>}
            {popular && <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-400">Populaire</span>}
            {thread.closed && <Badge><Lock className="mr-1 h-3 w-3" />Clôturée</Badge>}
            {thread.category === 'annonces' && <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-400">Annonce</span>}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-fg-muted">
          <span>Par <span className={cn('font-semibold', authorColor(thread))} title={thread.author?.levelTitle}>{thread.authorPseudonym}</span></span>
          <span title={dateTitle}>Publié {formatRelative(thread.createdAt)}</span>
          <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{thread.replies} réponses</span>
          <span>{thread.replies + 1} messages</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{thread.views} vues</span>
          {!thread.closed && <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onReply(thread)}>Répondre</button>}
          <button type="button" className="inline-flex items-center gap-1 hover:text-primary" onClick={() => onReport(thread)}><Flag className="h-3.5 w-3.5" />Signaler</button>
        </div>
      </div>
    </div>
  </article>
}


function QuickReply({ thread, onClose }: { thread: ForgeThread; onClose: () => void }) {
  const reply = useReplyToThread(thread.id)
  const { toast } = useToast()
  const key = `forge-draft-${thread.id}`
  const [body, setBody] = useState(() => { try { return localStorage.getItem(key) ?? `@${thread.authorPseudonym} ` } catch { return `@${thread.authorPseudonym} ` } })
  const [preview, setPreview] = useState(false)
  useEffect(() => { try { localStorage.setItem(key, body) } catch { /* Storage may be unavailable */ } }, [body, key])
  const send = () => {
    if (body.trim().length < 20) { toast('Réponse trop courte', { description: '20 caractères minimum.', kind: 'error' }); return }
    reply.mutate(body.trim(), { onSuccess: () => { try { localStorage.removeItem(key) } catch { /* ignore */ } toast('Réponse publiée'); onClose() }, onError: (error) => toast('Envoi impossible', { kind: 'error', description: error instanceof Error ? error.message : 'Erreur inconnue' }) })
  }
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-label="Réponse rapide" className="w-full max-w-xl rounded-2xl border border-border bg-surface p-5 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3"><div><p className="font-display font-bold text-fg">Répondre à la discussion</p><p className="mt-1 line-clamp-1 text-xs text-fg-muted">{thread.title}</p></div><button className="text-sm text-fg-muted hover:text-fg" onClick={onClose}>Fermer</button></div>
      {preview ? <div className="min-h-36 whitespace-pre-wrap rounded-lg border border-border p-3 text-sm text-fg">{body}</div> : <Textarea aria-label="Votre réponse" rows={7} value={body} onChange={event => setBody(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); send() } }} />}
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-fg-muted"><span>{body.length} caractères · Brouillon local</span><button className="hover:text-primary" onClick={() => setPreview(!preview)}>{preview ? 'Éditer' : 'Prévisualiser'}</button></div>
      <p className="mt-2 text-xs text-fg-subtle">Markdown et mentions saisis en texte brut. Notifications et XP soumis aux règles du serveur.</p>
      <div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Annuler</Button><Button onClick={send} loading={reply.isPending} disabled={thread.closed}><Send className="h-4 w-4" /> Publier</Button></div>
    </section>
  </div>
}

export function ForgePage() {
  const { user: me } = useAuth()
  const [quickReply, setQuickReply] = useState<ForgeThread | null>(null)
  const [reportTarget, setReportTarget] = useState<ForgeThread | null>(null)
  const canModerate = Boolean(me?.roles?.some(role => role === 'moderator' || role === 'admin'))
  const [category, setCategory] = useState<ForgeCategorySlug | 'all'>('all'); const [search, setSearch] = useState(''); const [moderator, setModerator] = useState(false)
  const { data: categories } = useForgeCategories(); const { data: threads, isLoading } = useForgeThreads(category === 'all' ? undefined : category)
  const create = useCreateThread(); const { toast } = useToast(); const [open, setOpen] = useState(false); const [title, setTitle] = useState(''); const [body, setBody] = useState(QUESTION_TEMPLATE); const [tags, setTags] = useState(''); const [newCategory, setNewCategory] = useState<ForgeCategorySlug>('entraide')
  const visible = useMemo(() => (threads ?? []).filter((thread) => `${thread.title} ${thread.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [threads, search])
  const publish = () => { if (title.trim().length < 8 || body.trim().length < 20 || body.trim() === QUESTION_TEMPLATE.trim()) return toast('Message incomplet', { description: 'Titre (8 caractères min.) et description (20 caractères min.) sont requis.', kind: 'error' }); create.mutate({ category: newCategory, title: title.trim(), body: body.trim(), tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean) }, { onSuccess: () => { setOpen(false); setTitle(''); setBody(QUESTION_TEMPLATE); setTags(''); toast('Question publiée', { description: 'Votre fil apparaît dans la rubrique.' }) }, onError: (error) => toast('Publication impossible', { kind: 'error', description: error instanceof Error ? error.message : 'Erreur inconnue' }) }) }
  return <div className="space-y-5">
    <header className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface px-5 py-6 shadow-card sm:px-7"><div className="art-grid absolute inset-0 opacity-[.22]" /><div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="kicker text-primary">Communauté · entraide & projets</p><h1 className="mt-1 font-display text-[32px] font-bold text-fg sm:text-[38px]">La Forge</h1><p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-fg-muted">Le forum des apprentis qui construisent, déboguent et transmettent. Chaque réponse utile fait progresser la communauté.</p></div><div className="flex flex-wrap gap-2">{canModerate && <Button variant={moderator ? 'soft' : 'outline'} size="sm" onClick={() => setModerator(!moderator)}><ShieldCheck className="h-4 w-4" /> {moderator ? 'Vue modérateur' : 'Vue étudiant'}</Button>}<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Poser une question</Button></div></div></header>
    {moderator && canModerate && <section className="border border-accent/25 bg-accent-soft/30 p-4"><div className="flex items-center justify-between"><div><p className="kicker text-accent">File de modération</p><p className="mt-1 font-display font-bold text-fg">File de modération</p></div><span className="text-[12px] text-fg-muted">Traitement des signalements : pas encore branché sur l’API.</span></div></section>}
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Rechercher dans La Forge…" /></div><p className="self-center text-[12px] text-fg-subtle">{visible.length} discussions</p></div>
    <nav aria-label="Rubriques" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1"><button onClick={() => setCategory('all')} className={cn('shrink-0 border px-3 py-2 text-[12px] font-semibold', category === 'all' ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border bg-surface text-fg-muted')}>Toutes</button>{(categories ?? []).map((cat) => <button key={cat.slug} onClick={() => setCategory(cat.slug)} className={cn('shrink-0 border px-3 py-2 text-[12px] font-semibold', category === cat.slug ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border bg-surface text-fg-muted')}>{cat.icon} {cat.name} <span className="ml-1 text-fg-subtle">{cat.threads}</span></button>)}</nav>
    {isLoading ? <div className="space-y-2">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-36 rounded-xl" />)}</div> : <section aria-label="Discussions de La Forge" className="space-y-2.5">{[...visible].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))).map((thread) => <ForgeDiscussionCard key={thread.id} thread={thread} onReply={setQuickReply} onReport={setReportTarget} />)}{!visible.length && <div className="rounded-xl border border-border bg-surface p-14 text-center"><MessageSquare className="mx-auto h-6 w-6 text-fg-subtle" /><p className="mt-3 font-display font-bold">Aucune discussion trouvée</p><p className="mt-1 text-sm text-fg-muted">Essayez un autre mot-clé ou lancez le sujet.</p></div>}</section>}
    {quickReply && <QuickReply key={quickReply.id} thread={quickReply} onClose={() => setQuickReply(null)} />}
    {reportTarget && <ForgeReportDialog key={reportTarget.id} threadId={reportTarget.id} label="une discussion" onClose={() => setReportTarget(null)} />}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Poser une question</DialogTitle><DialogDescription>Un contexte précis aide la communauté à vous répondre vite.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Rubrique</Label><Select value={newCategory} onValueChange={(value) => setNewCategory(value as ForgeCategorySlug)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(categories ?? []).map((cat) => <SelectItem key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="title">Titre</Label><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="body">Détail</Label><ul className="space-y-0.5 rounded-lg border border-border bg-surface-2 p-3 text-[12px] text-fg-muted"><li>· <b>Contexte</b> : page, module ou quête concernée.</li><li>· <b>Code ou extrait</b> : le minimum qui reproduit le problème.</li><li>· <b>Résultat attendu</b> et ce que vous obtenez (message d’erreur exact).</li><li>· <b>Déjà essayé</b> : ce que vous avez testé.</li><li>· Pas de livrable de quête complet à faire corriger ici : la validation reste celle du formateur.</li></ul><Textarea id="body" rows={9} value={body} onChange={(event) => setBody(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="tags">Mots-clés</Label><Input id="tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="react, typescript" /></div></div><DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button><Button loading={create.isPending} onClick={publish}>Publier</Button></DialogFooter></DialogContent></Dialog>
  </div>
}
