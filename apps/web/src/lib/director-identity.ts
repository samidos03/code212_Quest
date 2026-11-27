import { useEffect, useState } from 'react'
export type DirectorIdentity = { nickname: string; bio: string; quote: string; avatar: string; status: 'normal' | 'averti' | 'signale' | 'banni'; messages: number; badges: string[] }
const key = 'code212.director.identity.v1'
export const defaultIdentity: DirectorIdentity = { nickname: '', bio: '', quote: '', avatar: '/avatars/super-admin.svg', status: 'normal', messages: 0, badges: ['Direction', 'Code212', 'Gouvernance'] }
export function useDirectorIdentity() {
  const [identity, setIdentity] = useState<DirectorIdentity>(() => { try { return { ...defaultIdentity, ...JSON.parse(localStorage.getItem(key) || '{}') } } catch { return defaultIdentity } })
  useEffect(() => { const onUpdate = () => { try { setIdentity({ ...defaultIdentity, ...JSON.parse(localStorage.getItem(key) || '{}') }) } catch { /* ignore invalid data */ } }; window.addEventListener('code212:identity-updated', onUpdate); return () => window.removeEventListener('code212:identity-updated', onUpdate) }, [])
  const updateIdentity = (next: DirectorIdentity) => { localStorage.setItem(key, JSON.stringify(next)); setIdentity(next); window.dispatchEvent(new Event('code212:identity-updated')) }
  return { identity, setIdentity: updateIdentity }
}
