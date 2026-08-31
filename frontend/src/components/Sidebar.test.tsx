import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'
import { logout } from '../services/authService'
import { getNotes, createNote } from '../services/noteService'

jest.mock('../services/authService', () => ({
  logout: jest.fn(),
}))

jest.mock('../services/noteService', () => ({
  getNotes: jest.fn(),
  createNote: jest.fn(),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  )

describe('Sidebar', () => {
  beforeEach(() => {
    globalThis.URL.createObjectURL = jest.fn()
    globalThis.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('navigation buttons', () => {
    it('navigates to /dashboard when Notes is clicked', () => {
      renderSidebar()

      fireEvent.click(screen.getByText('Notes'))

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('navigates to /dashboard?view=trash when Trash is clicked', () => {
      renderSidebar()

      fireEvent.click(screen.getByText('Trash'))

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard?view=trash')
    })

    it('navigates to /profile when Profile is clicked', () => {
      renderSidebar()

      fireEvent.click(screen.getByText('Profile'))

      expect(mockNavigate).toHaveBeenCalledWith('/profile')
    })
  })

  describe('handleLogout', () => {
    it('navigates to /login on successful logout', async () => {
      ;(logout as jest.Mock).mockResolvedValueOnce(undefined)

      renderSidebar()
      fireEvent.click(screen.getByText('Log out'))

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
    })

    it('shows an error message when logout fails', async () => {
      ;(logout as jest.Mock).mockRejectedValueOnce(new Error('Logout failed!'))

      renderSidebar()
      fireEvent.click(screen.getByText('Log out'))

      expect(await screen.findByText('Logout failed!')).toBeInTheDocument()
    })

    it('wraps a non-Error rejection with a fallback message', async () => {
      ;(logout as jest.Mock).mockRejectedValueOnce('network down')

      renderSidebar()
      fireEvent.click(screen.getByText('Log out'))

      expect(await screen.findByText('Logout failed!')).toBeInTheDocument()
    })
  })

  describe('handleExportClick', () => {
    it('shows a preview modal with the note count on success', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([
        { _id: '1', title: 'Note A', content: '<p>Hello</p>', createdAt: '', updatedAt: '' },
      ])

      renderSidebar()
      fireEvent.click(screen.getByLabelText('Export notes to file'))

      expect(await screen.findByRole('heading', { name: 'Export notes' })).toBeInTheDocument()
    })

    it('shows an error when there are no notes to export', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([])

      renderSidebar()
      fireEvent.click(screen.getByLabelText('Export notes to file'))

      expect(await screen.findByText('You have no notes to export yet')).toBeInTheDocument()
    })

    it('shows an error when fetching notes fails', async () => {
      ;(getNotes as jest.Mock).mockRejectedValueOnce(new Error('Failed to export notes!'))

      renderSidebar()
      fireEvent.click(screen.getByLabelText('Export notes to file'))

      expect(await screen.findByText('Failed to export notes!')).toBeInTheDocument()
    })
  })

  describe('confirmExport', () => {
    it('triggers a file download and shows a success message', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([
        { _id: '1', title: 'Note A', content: '<p>Hello</p>', createdAt: '', updatedAt: '' },
      ])

      renderSidebar()
      fireEvent.click(screen.getByLabelText('Export notes to file'))
      fireEvent.click(await screen.findByText('Download file'))

      expect(globalThis.URL.createObjectURL).toHaveBeenCalled()
      expect(await screen.findByText('Exported 1 note')).toBeInTheDocument()
    })

    it('closes the modal without exporting when Cancel is clicked', async () => {
      ;(getNotes as jest.Mock).mockResolvedValueOnce([
        { _id: '1', title: 'Note A', content: '', createdAt: '', updatedAt: '' },
      ])

      renderSidebar()
      fireEvent.click(screen.getByLabelText('Export notes to file'))
      await screen.findByRole('heading', { name: 'Export notes' })
      fireEvent.click(screen.getByText('Cancel'))

      await waitFor(() => expect(screen.queryByRole('heading', { name: 'Export notes' })).not.toBeInTheDocument())
      expect(globalThis.URL.createObjectURL).not.toHaveBeenCalled()
    })
  })

  describe('handleFileSelected', () => {
    it('shows a preview of parsed notes after selecting a valid file', async () => {
      renderSidebar()
      const input = screen.getByLabelText('Choose a notes file to import')
      const file = new File(['=== First note ===\nSome content'], 'notes.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      expect(await screen.findByText('First note')).toBeInTheDocument()
    })

    it('shows an error when the file has no valid notes', async () => {
      renderSidebar()
      const input = screen.getByLabelText('Choose a notes file to import')
      const file = new File(['not a valid format'], 'notes.txt', { type: 'text/plain' })

      fireEvent.change(input, { target: { files: [file] } })

      expect(await screen.findByText('No valid notes found in that file')).toBeInTheDocument()
    })

    it('rejects files larger than 5MB', async () => {
      renderSidebar()
      const input = screen.getByLabelText('Choose a notes file to import')
      const file = new File(['=== Note ===\ncontent'], 'notes.txt', { type: 'text/plain' })
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })

      fireEvent.change(input, { target: { files: [file] } })

      expect(await screen.findByText('That file is too large (max 5MB)')).toBeInTheDocument()
    })
  })

  describe('confirmImport', () => {
    it('imports every parsed note and reports success', async () => {
      ;(createNote as jest.Mock).mockResolvedValue({ _id: 'x', title: '', content: '', createdAt: '', updatedAt: '' })

      renderSidebar()
      const input = screen.getByLabelText('Choose a notes file to import')
      const file = new File(['=== A ===\nhi\n\n=== B ===\nthere'], 'notes.txt', { type: 'text/plain' })
      fireEvent.change(input, { target: { files: [file] } })

      await screen.findByText('A')
      fireEvent.click(screen.getByText('Import 2 notes'))

      expect(await screen.findByText('Imported 2 of 2 notes')).toBeInTheDocument()
      expect(createNote).toHaveBeenCalledTimes(2)
    })

    it('reports partial failures when some notes fail to import', async () => {
      ;(createNote as jest.Mock)
        .mockResolvedValueOnce({ _id: 'x', title: '', content: '', createdAt: '', updatedAt: '' })
        .mockRejectedValueOnce(new Error('failed'))

      renderSidebar()
      const input = screen.getByLabelText('Choose a notes file to import')
      const file = new File(['=== A ===\nhi\n\n=== B ===\nthere'], 'notes.txt', { type: 'text/plain' })
      fireEvent.change(input, { target: { files: [file] } })

      await screen.findByText('A')
      fireEvent.click(screen.getByText('Import 2 notes'))

      expect(await screen.findByText('Imported 1 of 2 notes')).toBeInTheDocument()
      expect(screen.getByText('1 note failed to import')).toBeInTheDocument()
    })
  })
})