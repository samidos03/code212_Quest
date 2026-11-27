import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

/* ---------------------------------------------------------------- helpers */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const DEMO_HINTS = [
  { email: 'apprenant@code212.ma', label: 'Apprenant', color: 'text-primary' },
  { email: 'directeur@code212.ma', label: 'Directeur', color: 'text-[#b98a20]' },
  { email: 'equipe@code212.ma', label: 'Équipe Code212', color: 'text-cyan-fg' },
  { email: 'moderateur@code212.ma', label: 'Modérateur', color: 'text-warning' },
  { email: 'admin@code212.ma', label: 'Administrateur', color: 'text-accent' },
]

/* ============================================================= COMPOSANT */

export function LoginModal() {
  const { login, loginWithUca, status, defaultPath } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  /* Focus email on mount */
  useEffect(() => {
    const timer = setTimeout(() => emailRef.current?.focus(), 320)
    return () => clearTimeout(timer)
  }, [])

  /* Redirect after successful auth */
  useEffect(() => {
    if (status === 'authenticated' && success) {
      const timer = setTimeout(() => navigate(defaultPath, { replace: true }), 500)
      return () => clearTimeout(timer)
    }
  }, [status, success, defaultPath, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      await login({ email, password })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail)
    setPassword('demo')
    setError(null)
  }

  return (
    /* Full-page centered layout */
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-4">
      {/* ---- Ambient background glows ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[90px]" />
        <div className="absolute -right-24 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[80px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/5 blur-[100px]" />
      </div>

      {/* ---- Subtle dot-grid background ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--fg)/0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ======================================================= CARD */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Glow border effect */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--primary)/0.35) 0%, transparent 50%, hsl(var(--accent)/0.25) 100%)',
          }}
        />

        <div className="relative rounded-2xl border border-border bg-surface shadow-lift">
          {/* ---- Header ---- */}
          <div className="relative overflow-hidden px-7 pb-6 pt-8">
            {/* Art-grid accent */}
            <div
              aria-hidden
              className="art-grid absolute inset-0 opacity-40"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface"
            />

            <div className="relative flex flex-col items-center gap-3 text-center">
              {/* Brand mark */}
              <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient shadow-[0_10px_28px_-8px_rgba(197,2,127,.65)]">
                <span className="font-display text-[22px] font-bold leading-none tracking-tight text-white">
                  212
                </span>
                <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
              </div>

              <div>
                <h1 className="font-display text-[26px] font-bold tracking-tight text-fg">
                  CODE<span className="text-accent">212</span>{' '}
                  <span className="text-gradient">Quest</span>
                </h1>
                <p className="mt-1 text-[13px] text-fg-muted">
                  Centre CODE212 · Université Cadi Ayyad
                </p>
              </div>
            </div>
          </div>

          {/* ---- Form ---- */}
          <div className="px-7 pb-7">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-6 text-center"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-success-soft">
                    <Sparkles className="h-7 w-7 text-success" />
                  </div>
                  <p className="font-display text-[17px] font-bold text-fg">Connexion réussie !</p>
                  <p className="text-[13px] text-fg-muted">Redirection en cours…</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4"
                >
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-[13px] font-semibold text-fg"
                    >
                      Adresse e-mail ou matricule
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                      <input
                        ref={emailRef}
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null) }}
                        placeholder="prenom.nom@uca.ac.ma"
                        className={cn(
                          'h-11 w-full rounded-xl border bg-surface-2 pl-10 pr-4 text-sm text-fg transition-all placeholder:text-fg-subtle focus:outline-none focus:ring-4',
                          error
                            ? 'border-danger focus:border-danger focus:ring-danger/15'
                            : 'border-border focus:border-primary/60 focus:ring-primary/10',
                        )}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-[13px] font-semibold text-fg"
                      >
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        className="text-[12px] font-medium text-primary hover:underline focus-visible:outline-none"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(null) }}
                        placeholder="••••••••"
                        className={cn(
                          'h-11 w-full rounded-xl border bg-surface-2 pl-10 pr-11 text-sm text-fg transition-all placeholder:text-fg-subtle focus:outline-none focus:ring-4',
                          error
                            ? 'border-danger focus:border-danger focus:ring-danger/15'
                            : 'border-border focus:border-primary/60 focus:ring-primary/10',
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-fg-subtle transition hover:text-fg focus-visible:outline-none"
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-[13px] text-danger">
                          <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-gradient text-sm font-semibold text-white shadow-[0_6px_18px_-8px_rgba(197,2,127,.65)] transition-all hover:brightness-110 hover:shadow-[0_10px_26px_-10px_rgba(103,1,230,.75)] active:scale-[.98] disabled:pointer-events-none disabled:opacity-55"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connexion…
                      </>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                    {/* Shimmer on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity hover:opacity-100"
                    />
                  </button>

                  {/* SSO Divider */}
                  <div className="relative flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-fg-subtle">
                      ou
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* SSO UCA Button */}
                  <button
                    type="button"
                    onClick={loginWithUca}
                    className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface-2 text-sm font-semibold text-fg transition-all hover:border-primary/40 hover:bg-primary-soft hover:text-primary active:scale-[.98]"
                  >
                    <GraduationCap className="h-4.5 w-4.5" />
                    Connexion via portail UCA
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* ---- Demo hints (mode démo uniquement) ---- */}
          {USE_MOCK && !success && (
            <div className="border-t border-border px-7 py-4">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-fg-subtle">
                Comptes de démonstration · mot de passe :{' '}
                <span className="normal-case tracking-normal text-fg-muted">demo</span>
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_HINTS.map((hint) => (
                  <button
                    key={hint.email}
                    type="button"
                    onClick={() => fillDemo(hint.email)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-left transition hover:border-border-strong hover:bg-surface-3"
                  >
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full bg-current', hint.color)} />
                    <span className={cn('text-[11px] font-semibold', hint.color)}>
                      {hint.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-[11px] text-fg-subtle">
          Université Cadi Ayyad · Centre CODE212 · Marrakech
          <br />
          <span className="text-fg-subtle/60">© 2026 — Tous droits réservés</span>
        </p>
      </motion.div>
    </div>
  )
}
