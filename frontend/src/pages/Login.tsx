import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { JSX } from 'react'
import AuthCard from '../components/AuthCard'
import { NotebookPen } from 'lucide-react'
import { login } from '../services/authService'


const Login = ():JSX.Element => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-3 md:p-6">
      <div className="w-full h-[calc(100vh-1.5rem)] md:h-[calc(100vh-3rem)] rounded-2xl overflow-hidden flex shadow-2xl">
        <div className="hidden md:flex w-1/2 bg-[#C0453A] text-white items-center justify-center px-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <NotebookPen size={40} />
              <h1 className="text-5xl font-bold">Notify</h1>
              </div>
              <p className="text-lg leading-relaxed">
                Keep track of your tasks. Stay disciplined and work efficiently.
              </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12 bg-white overflow-y-auto">
          <AuthCard
            title="Welcome back"
            subtitle="Log in to continue to Notify"
            footer={
              <>
                Don't have an account? <Link to="/signup" className="text-[#C0453A] font-medium">Sign up</Link>
              </>
            }
          >
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0453A]"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0453A]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C0453A] text-white font-medium py-2 rounded-md hover:opacity-90 transition"
              >
                Log in
              </button>
            </form>
          </AuthCard>
        </div>
      </div>
    </div>
  )
}

export default Login