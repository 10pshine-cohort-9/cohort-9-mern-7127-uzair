import type { JSX } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { getNotes, createNote, updateNote, deleteNote, getTrash, restoreNote, permanentlyDeleteNote } from '../services/noteService'
import type { Note } from '../components/NoteCard'
import NoteCard from '../components/NoteCard'
import NoteEditor from '../components/NotesEditor'
import Sidebar from '../components/Sidebar'
import EmptyState from '../components/emptyState'
import DOMPurify from 'dompurify'

const Dashboard = (): JSX.Element => {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchParams] = useSearchParams()
  const [view, setView] = useState<'notes' | 'trash'>(
    searchParams.get('view') === 'trash' ? 'trash' : 'notes'
  )
  const [error, setError] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const paramView = searchParams.get('view')
    setView(paramView === 'trash' ? 'trash' : 'notes')
    setSelectedNote(null)
    setIsCreating(false)
  }, [searchParams])

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = view === 'trash' ? await getTrash() : await getNotes();
        setNotes(data);
      } catch (error) {
        if(error instanceof Error && error.message === "Not Authorized!"){
          navigate('/login');
          return;
        }

        setError(error instanceof Error ? error.message : 'Failed to load Notes!')
      }
    }

    fetchNotes()
  }, [view])

  useEffect(() => {
    if(selectedNote){
      setEditTitle(selectedNote.title)
      setEditContent(selectedNote.content)
    }
  }, [selectedNote])

  const handleNewNote = () => {
    setSelectedNote(null)
    setEditTitle('')
    setEditContent('')
    setIsCreating(true)
  }

  const createNewNote = async () => {
    try {
      const newNote = await createNote(editTitle, editContent)
      setNotes([newNote, ...notes])
      setSelectedNote(newNote)
      setIsCreating(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create Note!")
    }
  }

  const handleUpdate = async () => {
    if(!selectedNote) return

    try {
      const updatedNote = await updateNote(selectedNote._id, editTitle, editContent)
      setNotes(notes.map((note) => (note._id === updatedNote._id ? updatedNote : note)))
      setSelectedNote(updatedNote)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save Note!")
    }
  }

  const handleSelectNote = (note: Note) => {
    setIsCreating(false)
    setSelectedNote(note)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const handleDelete = async () => {
    if(!selectedNote) return

    try {
      await deleteNote(selectedNote._id)
      setNotes(notes.filter((note) => note._id !== selectedNote._id))
      setSelectedNote(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to Delete Note!')
    }
  }

  const handleRestore = async (note: Note) => {
    try {
      await restoreNote(note._id)
      setNotes(notes.filter((n)=> n._id !== note._id))
      setSelectedNote(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to restore note!')
    }
  }

  const handlePermanentDelete = async (note: Note) => {
    try {
      await permanentlyDeleteNote(note._id)
      setNotes(notes.filter((n) => n._id !== note._id))
      setSelectedNote(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to permanently delete note!')
    }
  }

  const filteredNotes = notes.filter((note) => {
    const term = searchTerm.toLowerCase()
    const plainContent = note.content.replace(/<[^>]*>/g, ' ').toLowerCase()

    return (
      note.title.toLowerCase().includes(term) ||
      plainContent.includes(term)
    )
  })

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />

      <div className={`${selectedNote || isCreating ? 'hidden' : 'flex'} md:flex w-full md:w-80 border-r border-gray-200 bg-[#FAF6EC] flex-col`}>
        <div className="flex items-center justify-between px-5 py-5">
          <h1 className="text-xl font-semibold text-[#1D2939]">
            {view === 'trash' ? 'Trash' : 'Notes'}
          </h1>
          {view === 'notes' && (
            <button
              onClick={handleNewNote}
              className="bg-[#C0453A] text-white text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90 transition">
                + New
            </button>
          )}
        </div>

        <div className="px-5 pb-3">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0453A]"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 px-5">{error}</p>}
        {notes.length === 0 && !error && (
          <p className="text-sm text-gray-500 px-5">
            {view === 'trash' ? 'Trash is empty.' : "You don't have any notes yet."}
          </p>
        )}

        <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              isSelected={selectedNote?._id === note._id}
              onClick={() => handleSelectNote(note)}
            />
          ))}
        </div>
      </div>

      <div className={`${selectedNote || isCreating ? 'flex' : 'hidden'} md:flex flex-1 flex-col px-12 py-10`}>
        <button
          onClick={() => {
            setSelectedNote(null)
            setIsCreating(false)
          }}
          className="md:hidden mb-4 text-sm text-gray-500"
        >
          ← Back to notes
        </button>
        {isCreating ? (
          <>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Note title"
              className="text-3xl font-bold text-[#1D2939] mb-6 outline-none"
            />

            <NoteEditor
              key="new"
              content=""
              onChange={setEditContent}
            />

            <button
              onClick={createNewNote}
              className="mt-6 self-start bg-[#C0453A] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition"
            >
              Create note
            </button>
          </>
        ) : selectedNote ? (
          view === 'trash' ? (
            <>
              <h1 className="text-3xl font-bold text-[#1D2939] mb-2">{selectedNote.title}</h1>
              <div
                className="text-base text-gray-700 mb-6"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedNote.content, {
                    ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'br']
                  })
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleRestore(selectedNote)}
                  className="bg-[#C0453A] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition"
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(selectedNote)}
                  className="text-sm font-medium px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Delete permanently
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-3xl font-bold text-[#1D2939] mb-2 outline-none"
              />
              <p className="text-xs text-gray-400 mb-6">
                Last updated {new Date(selectedNote.updatedAt).toLocaleString()}
              </p>

              <NoteEditor
                key={selectedNote._id}
                content={editContent}
                onChange={setEditContent}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  className="bg-[#C0453A] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition"
                >
                  Save
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm font-medium px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Delete
                </button>
              </div>
            </>
          )
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

export default Dashboard