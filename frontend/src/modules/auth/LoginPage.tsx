import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { Lock, User, Hexagon, ArrowRight, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/store/AuthContext'

export function LoginPage() {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const { login, isConnecting, error } = useAuth()

  const logoRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2 })
    tl.fromTo(logoRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.5)' }, 0.3)
    tl.fromTo(formRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.5)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(studentId, password)
  }

  return (
    <div className="min-h-screen bg-[#080a0e] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,156,249,0.04) 0%, transparent 70%)' }} />
        {/* Grid */}
        <div className="absolute inset-0 sbt-grid-bg opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Logo */}
        <div ref={logoRef} className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#00e5a0] rounded-2xl flex items-center justify-center mb-4"
            style={{ boxShadow: '0 0 40px rgba(0,229,160,0.25)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3L24 8.5V19.5L14 25L4 19.5V8.5L14 3Z" stroke="#050708" strokeWidth="2" fill="none"/>
              <circle cx="14" cy="14" r="4" fill="#050708"/>
            </svg>
          </div>
          <h1 className="font-mono font-bold text-2xl tracking-tight">
            Trust<span className="text-[#00e5a0]">Pay</span>
          </h1>
          <p className="text-[13px] text-[#8b8fa8] mt-1.5 text-center">
            Blockchain-verified payment receipts<br/>for University of Buea
          </p>
        </div>

        {/* Form */}
        <div ref={formRef} className="bg-[#0f1117] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
          <h2 className="text-[15px] font-semibold mb-5 text-[#e8eaf0]">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Student ID"
              placeholder="e.g. UB22CS041"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {error && (
              <div className="flex items-center gap-2 text-xs text-[#ff5757] bg-[rgba(255,87,87,0.08)] border border-[rgba(255,87,87,0.2)] rounded-lg p-2.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={isConnecting} icon={<ArrowRight className="w-4 h-4" />} className="mt-1 w-full justify-between">
              Sign In
            </Button>
          </form>

          <p className="text-[11px] text-[#3e4155] text-center mt-5 font-mono">
            Demo: use any Student ID (6+ chars) + any password
          </p>
        </div>

        {/* Chain info */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[11px] font-mono text-[#3e4155]">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0]" />Polygon Amoy</span>
          <span>ERC-5192 Soulbound</span>
          <span>Powered by IPFS</span>
        </div>
      </div>
    </div>
  )
}
