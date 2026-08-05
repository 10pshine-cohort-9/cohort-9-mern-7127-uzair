import type { JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { NotebookPen, Trash2, LogOut } from 'lucide-react'
import { getNotes } from '../services/noteService'
import type { Note } from '../components/NoteCard'
import NoteCard from '../components/NoteCard'
import {logout} from '../services/authService'

const Dashboard = (): JSX.Element => {
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes(); 
        setNotes(data);
      } catch (error) {
        if(error instanceof Error && error.message === "Not Authorized!"){
          navigate('login');
          return;
        }

        setError(error instanceof Error ? error.message : 'Failed to load Notes!')
      }
    }

    fetchNotes()
  }, [])

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout Failed!')
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-16 md:w-56 bg-[#1D2939] text-white flex flex-col py-6 px-3">
        <div className="flex items-center gap-2 px-2 mb-8">
          <NotebookPen size={24} />
          <span className="hidden md:inline text-lg font-bold">Notify</span>
        </div>
 
        <nav className="flex flex-col gap-1">
          <button className="flex items-center gap-2 px-2 py-2 rounded-md bg-[#C0453A] text-sm font-medium">
            <NotebookPen size={16} />
            <span className="hidden md:inline">Notes</span>
          </button>
          <button className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10">
            <Trash2 size={16} />
            <span className="hidden md:inline">Trash</span>
          </button>
        </nav>
 
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Log out</span>
        </button>
      </div>

      <div className="w-full md:w-80 border-r border-gray-200 bg-[#FAF6EC] flex flex-col">
        <div className="flex items-center justify-between px-5 py-5">
          <h1 className="text-xl font-semibold text-[#1D2939]">Notes</h1>
          <button className="bg-[#C0453A] text-white text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90 transition">
            + New
          </button>
        </div>
 
        {error && <p className="text-sm text-red-600 px-5">{error}</p>}
        {notes.length === 0 && !error && (
          <p className="text-sm text-gray-500 px-5">You don't have any notes yet.</p>
        )}
 
        <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-4">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              isSelected={selectedNote?._id === note._id}
              onClick={() => setSelectedNote(note)}
            />
          ))}
        </div>
      </div>
 
      <div className="hidden md:flex flex-1 flex-col px-12 py-10">
        {selectedNote ? (
          <>
            <h1 className="text-3xl font-bold text-[#1D2939] mb-2">{selectedNote.title}</h1>
            <p className="text-xs text-gray-400 mb-6">
              Last updated {new Date(selectedNote.updatedAt).toLocaleString()}
            </p>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedNote.content}
            </p>
          </>
        ) : (
          <p className="text-gray-400">Select a note to see it here</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard