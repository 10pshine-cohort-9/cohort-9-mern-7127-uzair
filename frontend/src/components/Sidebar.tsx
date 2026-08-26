import { NotebookPen, Trash2, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'
import { useState } from 'react'

const Sidebar = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout failed!')
    }
  }

  return (
    <div className="w-16 md:w-56 bg-[#1D2939] text-white flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-[#C0453A] flex items-center justify-center shrink-0">
          <NotebookPen size={18} />
        </div>
        <span className="hidden md:inline text-lg font-bold tracking-tight">Notify</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <NotebookPen size={16} />
          <span className="hidden md:inline">Notes</span>
        </button>
        <button
          onClick={() => navigate('/dashboard?view=trash')}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Trash2 size={16} />
          <span className="hidden md:inline">Trash</span>
        </button>
      </nav>

      <div className="h-px bg-white/10 my-4 mx-2" />

      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
      >
        <User size={16} />
        <span className="hidden md:inline">Profile</span>
      </button>

      {error && <p className="text-xs text-red-400 px-2.5 mt-2">{error}</p>}

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
      >
        <LogOut size={16} />
        <span className="hidden md:inline">Log out</span>
      </button>
    </div>
  )
}

export default Sidebar