import { useEffect, useState } from 'react'

export type StudentIdentity = {
  nickname: string
  bio: string
  quote: string
  avatar: string
}

const key = 'code212.student.identity.v1'
export const defaultStudentIdentity: StudentIdentity = { nickname: '', bio: '', quote: '', avatar: '/avatars/launch/forge-celeste.png' }

function readIdentity(): StudentIdentity {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}') as Partial<StudentIdentity>
    const avatar = typeof saved.avatar === 'string' && saved.avatar.startsWith('/avatars/launch/') ? saved.avatar : defaultStudentIdentity.avatar
    return { ...defaultStudentIdentity, ...saved, avatar }
  } catch { return defaultStudentIdentity }
}

export function useStudentIdentity() {
  const [identity, setIdentity] = useState<StudentIdentity>(readIdentity)

  useEffect(() => {
    const onUpdate = () => {
      setIdentity(readIdentity())
    }
    window.addEventListener('code212:student-identity-updated', onUpdate)
    return () => window.removeEventListener('code212:student-identity-updated', onUpdate)
  }, [])

  const updateIdentity = (next: StudentIdentity) => {
    localStorage.setItem(key, JSON.stringify(next))
    setIdentity(next)
    window.dispatchEvent(new Event('code212:student-identity-updated'))
  }

  return { identity, setIdentity: updateIdentity }
}
