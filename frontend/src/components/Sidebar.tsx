import { NotebookPen, Trash2, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'

const Sidebar = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="w-16 md:w-56 bg-[#1D2939] text-white flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-2 mb-8">
        <NotebookPen size={24} />
        <span className="hidden md:inline text-lg font-bold">Notify</span>
      </div>

      <nav className="flex flex-col gap-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10"
        >
          <NotebookPen size={16} />
          <span className="hidden md:inline">Notes</span>
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10"
        >
          <Trash2 size={16} />
          <span className="hidden md:inline">Trash</span>
        </button>
      </nav>

      <button
        onClick={() => navigate('/profile')}
        className="mt-2 flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10"
      >
        <User size={16} />
        <span className="hidden md:inline">Profile</span>
      </button>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10"
      >
        <LogOut size={16} />
        <span className="hidden md:inline">Log out</span>
      </button>
    </div>
  )
}

export default Sidebar;