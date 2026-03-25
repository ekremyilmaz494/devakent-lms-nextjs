'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Successful login - fetch session to get user role
      const session = await fetch('/api/auth/session').then(res => res.json())

      // Role-based redirect
      if (session?.user?.role === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard')
      } else if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (session?.user?.role === 'STAFF') {
        router.push('/staff/dashboard')
      } else {
        // Fallback to admin dashboard if role is unclear
        router.push('/admin/dashboard')
      }

      router.refresh()
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      setIsLoading(false)
    }
  }

  return (
    <div className="app-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card/95 p-8 shadow-xl backdrop-blur-sm">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <span className="font-display text-2xl font-bold text-white">
              D
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
            Devakent LMS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hastane Personel Eğitim Sistemi
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-error bg-error/10 p-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-posta
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@hastane.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Şifre
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              'Giriş yapılıyor...'
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Giriş Yap
              </>
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Test Kullanıcıları
          </p>
          <div className="space-y-2 text-xs">
            <div>
              <p className="font-medium">Super Admin</p>
              <p className="font-mono text-muted-foreground">super@devakent.com / super123</p>
            </div>
            <div>
              <p className="font-medium">Admin (Ankara)</p>
              <p className="font-mono text-muted-foreground">admin1@ankara.com / admin123</p>
            </div>
            <div>
              <p className="font-medium">Personel (Ankara)</p>
              <p className="font-mono text-muted-foreground">staff1@ankara.com / staff123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
