import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NotebookPen, Mail, Lock, ArrowRight } from 'lucide-react'
import { login } from '../services/authService'
import type { JSX } from 'react'

const Login = () : JSX.Element => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1D2939] to-[#0F1621] flex items-center justify-center p-3 md:p-6">
      <div className="w-full h-[calc(100vh-1.5rem)] md:h-[calc(100vh-3rem)] rounded-2xl overflow-hidden flex shadow-[0_20px_60px_-15px_rgba(192,69,58,0.35)]">
        
        <div className="hidden md:flex relative w-1/2 bg-[#C0453A] text-white items-center justify-center px-12 overflow-hidden">
          <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl -top-10 -left-10" />
          <div className="absolute w-96 h-96 bg-black/10 rounded-full blur-3xl -bottom-24 -right-16" />

          <div className="relative max-w-lg flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <NotebookPen size={45} />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-2">Notify</h1>
              <p className="text-lg leading-relaxed text-white/90">
                Every idea deserves a margin to grow in. Jot it down, tag it, find it again.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12 bg-white overflow-y-auto">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-semibold text-[#1D2939] mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-8">Log in to continue to Notify</p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0453A] focus:border-transparent transition"
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C0453A] focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#C0453A] text-white font-medium py-3 rounded-xl shadow-lg shadow-red-900/10 hover:shadow-red-900/20 hover:-translate-y-0.5 transition-all"
              >
                Log in
                <ArrowRight size={16} />
              </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-8">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#C0453A] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login