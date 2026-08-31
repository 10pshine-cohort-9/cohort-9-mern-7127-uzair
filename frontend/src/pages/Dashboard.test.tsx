import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import {
  getNotes,
  getTrash,
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  permanentlyDeleteNote,
} from '../services/noteService'

jest.mock('../services/noteService', () => ({
  getNotes: jest.fn(),
  getTrash: jest.fn(),
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  restoreNote: jest.fn(),
  permanentlyDeleteNote: jest.fn(),
}))

const mockNavigate = jest.fn()
let mockSearchParams = new URLSearchParams()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}))

const note = (overrides = {}) => ({
  _id: '1',
  title: 'First note',
  content: '<p>Hello world</p>',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )

describe('Dashboard', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('fetchNotes', () => {
    it('fetches and renders notes on mount', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([note(), note({ _id: '2', title: 'Second note' })])

      renderDashboard()

      expect(await screen.findByText('First note')).toBeInTheDocument()
      expect(screen.getByText('Second note')).toBeInTheDocument()
      expect(getNotes).toHaveBeenCalled()
    })

    it('fetches trash instead of notes when the view query param is trash', async () => {
      mockSearchParams = new URLSearchParams('view=trash')
      ;(getTrash as jest.Mock).mockResolvedValueOnce([note({ title: 'Deleted note' })])

      renderDashboard()

      expect(await screen.findByText('Deleted note')).toBeInTheDocument()
      expect(getTrash).toHaveBeenCalled()
      expect(getNotes).not.toHaveBeenCalled()
    })

    it('navigates to /login when the user is not authorized', async () => {
      ;(getNotes as jest.Mock).mockRejectedValueOnce(new Error('Not Authorized!'))

      renderDashboard()

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
    })

    it('shows an error message for other failures', async () => {
      ;(getNotes as jest.Mock).mockRejectedValueOnce(new Error('Failed to load Notes!'))

      renderDashboard()

      expect(await screen.findByText('Failed to load Notes!')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalledWith('/login')
    })

    it('shows an empty-state message when there are no notes', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([])

      renderDashboard()

      expect(await screen.findByText("You don't have any notes yet.")).toBeInTheDocument()
    })
  })

  describe('createNewNote', () => {
    it('creates a note and adds it to the list', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([])
      ;(createNote as jest.Mock).mockResolvedValueOnce(note({ title: 'Brand new' }))

      renderDashboard()
      await screen.findByText("You don't have any notes yet.")

      fireEvent.click(screen.getByText('+ New'))
      fireEvent.change(screen.getByPlaceholderText('Note title'), { target: { value: 'Brand new' } })
      fireEvent.click(screen.getByText('Create note'))

      await waitFor(() => expect(createNote).toHaveBeenCalledWith('Brand new', ''))
      expect(await screen.findByText('Brand new')).toBeInTheDocument()
    })

    it('shows an error message when note creation fails', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([])
      ;(createNote as jest.Mock).mockRejectedValueOnce(new Error('Failed to create Note!'))

      renderDashboard()
      await screen.findByText("You don't have any notes yet.")

      fireEvent.click(screen.getByText('+ New'))
      fireEvent.click(screen.getByText('Create note'))

      expect(await screen.findByText('Failed to create Note!')).toBeInTheDocument()
    })
  })

  describe('handleUpdate', () => {
    it('saves changes to the selected note', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([note()])
      ;(updateNote as jest.Mock).mockResolvedValueOnce(note({ title: 'Updated title' }))

      renderDashboard()
      fireEvent.click(await screen.findByText('First note'))
      fireEvent.change(screen.getByDisplayValue('First note'), { target: { value: 'Updated title' } })
      fireEvent.click(screen.getByText('Save'))

      await waitFor(() => expect(updateNote).toHaveBeenCalledWith('1', 'Updated title', note().content))
    })

    it('shows an error message when saving fails', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([note()])
      ;(updateNote as jest.Mock).mockRejectedValueOnce(new Error('Failed to save Note!'))

      renderDashboard()
      fireEvent.click(await screen.findByText('First note'))
      fireEvent.click(screen.getByText('Save'))

      expect(await screen.findByText('Failed to save Note!')).toBeInTheDocument()
    })
  })

  describe('handleDelete', () => {
    it('removes the note from the list', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([note()])
      ;(deleteNote as jest.Mock).mockResolvedValueOnce(undefined)

      renderDashboard()
      fireEvent.click(await screen.findByText('First note'))
      fireEvent.click(screen.getByText('Delete'))

      await waitFor(() => expect(deleteNote).toHaveBeenCalledWith('1'))
      await waitFor(() => expect(screen.queryByText('First note')).not.toBeInTheDocument())
    })

    it('shows an error message when deletion fails', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([note()])
      ;(deleteNote as jest.Mock).mockRejectedValueOnce(new Error('Failed to Delete Note!'))

      renderDashboard()
      fireEvent.click(await screen.findByText('First note'))
      fireEvent.click(screen.getByText('Delete'))

      expect(await screen.findByText('Failed to Delete Note!')).toBeInTheDocument()
    })
  })

  describe('handleRestore', () => {
    it('restores a note from the trash view', async () => {
      mockSearchParams = new URLSearchParams('view=trash')
      ;(getTrash as jest.Mock).mockResolvedValueOnce([note({ title: 'Deleted note' })])
      ;(restoreNote as jest.Mock).mockResolvedValueOnce(undefined)

      renderDashboard()
      fireEvent.click(await screen.findByText('Deleted note'))
      fireEvent.click(screen.getByText('Restore'))

      await waitFor(() => expect(restoreNote).toHaveBeenCalledWith('1'))
      await waitFor(() => expect(screen.queryByText('Deleted note')).not.toBeInTheDocument())
    })

    it('shows an error message when restoring fails', async () => {
      mockSearchParams = new URLSearchParams('view=trash')
      ;(getTrash as jest.Mock).mockResolvedValueOnce([note({ title: 'Deleted note' })])
      ;(restoreNote as jest.Mock).mockRejectedValueOnce(new Error('Failed to restore note!'))

      renderDashboard()
      fireEvent.click(await screen.findByText('Deleted note'))
      fireEvent.click(screen.getByText('Restore'))

      expect(await screen.findByText('Failed to restore note!')).toBeInTheDocument()
    })
  })

  describe('handlePermanentDelete', () => {
    it('permanently deletes a note from the trash view', async () => {
      mockSearchParams = new URLSearchParams('view=trash')
      ;(getTrash as jest.Mock).mockResolvedValueOnce([note({ title: 'Deleted note' })])
      ;(permanentlyDeleteNote as jest.Mock).mockResolvedValueOnce(undefined)

      renderDashboard()
      fireEvent.click(await screen.findByText('Deleted note'))
      fireEvent.click(screen.getByText('Delete permanently'))

      await waitFor(() => expect(permanentlyDeleteNote).toHaveBeenCalledWith('1'))
    })

    it('shows an error message when permanent deletion fails', async () => {
      mockSearchParams = new URLSearchParams('view=trash')
      ;(getTrash as jest.Mock).mockResolvedValueOnce([note({ title: 'Deleted note' })])
      ;(permanentlyDeleteNote as jest.Mock).mockRejectedValueOnce(new Error('Failed to permanently delete note!'))

      renderDashboard()
      fireEvent.click(await screen.findByText('Deleted note'))
      fireEvent.click(screen.getByText('Delete permanently'))

      expect(await screen.findByText('Failed to permanently delete note!')).toBeInTheDocument()
    })
  })

  describe('filteredNotes', () => {
    it('filters notes by title', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([
        note({ _id: '1', title: 'Groceries' }),
        note({ _id: '2', title: 'Work plan' }),
      ])

      renderDashboard()
      await screen.findByText('Groceries')

      fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'work' } })

      expect(screen.queryByText('Groceries')).not.toBeInTheDocument()
      expect(screen.getByText('Work plan')).toBeInTheDocument()
    })

    it('filters notes by plain-text content, ignoring HTML tags', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([
        note({ _id: '1', title: 'Note A', content: '<p>pineapple pizza</p>' }),
        note({ _id: '2', title: 'Note B', content: '<p>something else</p>' }),
      ])

      renderDashboard()
      await screen.findByText('Note A')

      fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'pineapple' } })

      expect(screen.getByText('Note A')).toBeInTheDocument()
      expect(screen.queryByText('Note B')).not.toBeInTheDocument()
    })
  })
})