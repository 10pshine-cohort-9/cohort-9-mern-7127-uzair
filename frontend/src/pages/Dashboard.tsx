import type { JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { NotebookPen } from 'lucide-react'

type Note = {
  _id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const Dashboard = (): JSX.Element => {
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch('http://localhost:5000/notes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setNotes(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load Notes!')
      }
    }

    fetchNotes()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#1D2939] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen size={28} />
          <span className="text-2xl font-bold">Notify</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-[#C0453A] px-4 py-2 rounded-md hover:opacity-90 transition"
        >
          Log out
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1D2939]">Your notes</h1>
          <button className="bg-[#C0453A] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition">
            + New note
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {notes.length === 0 && !error && (
          <p className="text-sm text-gray-500">You don't have any notes yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note._id} className="bg-[#FAF6EC] rounded-lg shadow-md p-5">
              <h2 className="text-lg font-semibold text-[#1D2939] mb-2">{note.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{note.content}</p>
              <p className="text-xs text-gray-400">
                Updated {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard