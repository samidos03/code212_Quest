import {
  Award,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Compass,
  Crown,
  Flame,
  Gauge,
  LayoutDashboard,
  Medal,
  MessageSquareText,
  ScrollText,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: string
  /** `dark` force le thème sombre sur cet écran (mode compétitif). */
  tone?: 'light' | 'dark'
}

export interface NavGroup {
  caption: string
  items: NavItem[]
}

/* ---------------------------------------------------------------- student */

export const studentNav: NavGroup[] = [
  {
    caption: 'Espace pédagogique',
    items: [
      { label: 'Vue d\u2019ensemble', to: '/', icon: LayoutDashboard, tone: 'light' },
      { label: 'Quêtes', to: '/quests', icon: Compass, badge: '12', tone: 'light' },
      { label: 'Parcours', to: '/paths', icon: BookOpenCheck, tone: 'light' },
      { label: 'Missions', to: '/missions', icon: Target, tone: 'light' },
      { label: 'Badges & voies', to: '/badges', icon: BadgeCheck, tone: 'light' },
      { label: 'La Forge', to: '/forge', icon: MessageSquareText, badge: '5', tone: 'light' },
      { label: 'Boutique', to: '/shop', icon: ShoppingBag, tone: 'light' },
      { label: 'Certifications', to: '/certifications', icon: Award, tone: 'light' },
    ],
  },
  {
    caption: 'Compétition',
    items: [
      { label: 'Arène', to: '/arena', icon: Swords, badge: '3', tone: 'dark' },
      { label: 'Classement', to: '/leaderboard', icon: Trophy, tone: 'dark' },
    ],
  },
  {
    caption: 'Compte',
    items: [
      { label: 'Profil & préférences', to: '/profile', icon: Gauge, tone: 'light' },
    ],
  },
]

/* ------------------------------------------------------------------ admin (legacy espace) */

export const adminNav: NavGroup[] = [
  {
    caption: 'Pilotage',
    items: [
      { label: 'Vue d\u2019ensemble', to: '/admin', icon: LayoutDashboard, tone: 'light' },
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart3, tone: 'light' },
      { label: 'Étudiants', to: '/admin/students', icon: Users, tone: 'light' },
    ],
  },
  {
    caption: 'Contenus & rewards',
    items: [
      { label: 'Quêtes', to: '/admin/quests', icon: ScrollText, tone: 'light' },
      { label: 'Validation', to: '/admin/validation', icon: ShieldCheck, badge: '3', tone: 'light' },
      { label: 'Règles XP', to: '/admin/rules', icon: Flame, tone: 'light' },
      { label: 'Modération', to: '/admin/moderation', icon: Medal, badge: '4', tone: 'light' },
    ],
  },
  {
    caption: 'Compte',
    items: [
      { label: 'Profil & préférences', to: '/profile', icon: Gauge, tone: 'light' },
    ],
  },
]

/* ---------------------------------------------------------------- director (Super Admin) */

export const directorNav: NavGroup[] = [
  {
    caption: 'Tableau de bord',
    items: [
      { label: 'Vue d\u2019ensemble', to: '/director', icon: Crown, tone: 'light' },
      { label: 'Analytics', to: '/director/analytics', icon: BarChart3, tone: 'light' },
    ],
  },
  {
    caption: 'Gouvernance',
    items: [
      { label: 'La Forge · Direction', to: '/director/forge', icon: MessageSquareText, tone: 'light' },
      { label: '\u00c9tudiants', to: '/director/students', icon: Users, tone: 'light' },
      { label: '\u00c9quipe Code212', to: '/director/team', icon: Award, tone: 'light' },
      { label: 'R\u00e8gles XP', to: '/director/rules', icon: Flame, tone: 'light' },
      { label: 'Mod\u00e9ration', to: '/director/moderation', icon: ShieldAlert, tone: 'light' },
    ],
  },
  {
    caption: 'Contenus',
    items: [
      { label: 'Qu\u00eates', to: '/director/quests', icon: ScrollText, tone: 'light' },
      { label: 'Validation', to: '/director/validation', icon: ShieldCheck, badge: '3', tone: 'light' },
      { label: 'Commandes', to: '/director/orders', icon: ShoppingBag, tone: 'light' },
    ],
  },
  {
    caption: 'Syst\u00e8me',
    items: [
      { label: 'Configuration', to: '/director/settings', icon: Settings2, tone: 'light' },
    ],
  },
  {
    caption: 'Compte',
    items: [
      { label: 'Profil & pr\u00e9f\u00e9rences', to: '/director/profile', icon: Gauge, tone: 'light' },
    ],
  },
]

/* --------------------------------------------------------------- administrator */

export const administratorNav: NavGroup[] = [
  {
    caption: 'Tableau de bord',
    items: [
      { label: 'Vue d\u2019ensemble', to: '/administrator', icon: LayoutDashboard, tone: 'light' },
      { label: 'Analytics', to: '/administrator/analytics', icon: BarChart3, tone: 'light' },
    ],
  },
  {
    caption: 'Gestion',
    items: [
      { label: 'Étudiants', to: '/administrator/students', icon: Users, tone: 'light' },
      { label: 'Équipe Code212', to: '/administrator/team', icon: Award, tone: 'light' },
      { label: 'Règles XP', to: '/administrator/rules', icon: Flame, tone: 'light' },
      { label: 'Configuration', to: '/administrator/settings', icon: Settings2, tone: 'light' },
    ],
  },
  {
    caption: 'Compte',
    items: [
      { label: 'Profil & préférences', to: '/profile', icon: Gauge, tone: 'light' },
    ],
  },
]

/* -------------------------------------------------------------------- team */

export const teamNav: NavGroup[] = [
  {
    caption: 'Tableau de bord',
    items: [
      { label: 'Vue d\u2019ensemble', to: '/team', icon: LayoutDashboard, tone: 'light' },
    ],
  },
  {
    caption: 'Pédagogie',
    items: [
      { label: 'Quêtes', to: '/team/quests', icon: ScrollText, tone: 'light' },
      { label: 'Parcours', to: '/team/paths', icon: BookOpenCheck, tone: 'light' },
      { label: 'Validation', to: '/team/validation', icon: ShieldCheck, badge: '3', tone: 'light' },
    ],
  },
  {
    caption: 'Apprenants',
    items: [
      { label: 'Étudiants', to: '/team/students', icon: Users, tone: 'light' },
      { label: 'Analytics', to: '/team/analytics', icon: BarChart3, tone: 'light' },
    ],
  },
  {
    caption: 'Compte',
    items: [
      { label: 'Profil & préférences', to: '/profile', icon: Gauge, tone: 'light' },
    ],
  },
]

/* --------------------------------------------------------------- moderator */

export const moderatorNav: NavGroup[] = [
  {
    caption: 'Tableau de bord',
    items: [
      { label: 'Vue d\u2019ensemble', to: '/moderator', icon: LayoutDashboard, tone: 'light' },
    ],
  },
  {
    caption: 'Modération',
    items: [
      { label: 'File de modération', to: '/moderator/queue', icon: ShieldAlert, badge: '4', tone: 'light' },
      { label: 'Rapports', to: '/moderator/reports', icon: Medal, tone: 'light' },
      { label: 'Journal d\u2019audit', to: '/moderator/audit', icon: ScrollText, tone: 'light' },
    ],
  },
  {
    caption: 'Forge',
    items: [
      { label: 'Discussions', to: '/moderator/forge', icon: MessageSquareText, tone: 'light' },
    ],
  },
  {
    caption: 'Compte',
    items: [
      { label: 'Profil & préférences', to: '/profile', icon: Gauge, tone: 'light' },
    ],
  },
]

/* ---------------------------------------------------------- space metadata */

export const spaceLabels = {
  student:       { title: 'Centre CODE212',   subtitle: 'Espace apprenant' },
  director:      { title: 'Directeur',         subtitle: 'Super Admin \u00b7 Code212' },
  admin:         { title: 'Administration',    subtitle: 'Pilotage du centre' },
  administrator: { title: 'Administrateur',    subtitle: 'Gestion globale' },
  team:          { title: '\u00c9quipe Code212', subtitle: 'Formateurs & mentors' },
  moderator:     { title: 'Mod\u00e9ration',   subtitle: 'Supervision communaut\u00e9' },
} as const

export const brandMarks = {
  symbol: '212',
  caption: 'SKILLS \u00b7 CHALLENGES \u00b7 FUTURE',
} as const

export const accentIcon = Sparkles
