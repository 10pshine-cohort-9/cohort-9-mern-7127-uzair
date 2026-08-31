import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getTrash,
  restoreNote,
  permanentlyDeleteNote,
} from './noteService'

describe('noteService', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getNotes', () => {
    it('returns notes on success', async () => {
      const mockNotes = [{ _id: '1', title: 'Test', content: '', createdAt: '', updatedAt: '' }]

      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotes,
      })

      const result = await getNotes()
      expect(result).toEqual(mockNotes)
    })

    it('throws an error when the request fails', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not Authorized!' }),
      })

      await expect(getNotes()).rejects.toThrow('Not Authorized!')
    })
  })

  describe('createNote', () => {
    it('sends title and content and returns the created note', async () => {
      const mockNote = { _id: '2', title: 'New note', content: 'Hello', createdAt: '', updatedAt: '' }

      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNote,
      })

      const result = await createNote('New note', 'Hello')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )
      expect(result).toEqual(mockNote)
    })

    it('throws an error when the server rejects the note', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Title is required' }),
      })

      await expect(createNote('', 'Hello')).rejects.toThrow('Title is required')
    })

    it('wraps a non-Error rejection when fetch itself fails', async () => {
      ;(globalThis.fetch as jest.Mock).mockRejectedValueOnce('network down')

      await expect(createNote('New note', 'Hello')).rejects.toThrow('Something went wrong!')
    })
  })

  describe('updateNote', () => {
    it('sends updated title and content to the correct note id', async () => {
      const mockUpdatedNote = { _id: '507f1f77bcf86cd799439011', title: 'Updated title', content: 'Updated content', createdAt: '', updatedAt: '' }

      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedNote,
      })

      const result = await updateNote('507f1f77bcf86cd799439011', 'Updated title', 'Updated content')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/507f1f77bcf86cd799439011'),
        expect.objectContaining({
          method: 'PUT',
          credentials: 'include',
        })
      )
      expect(result.title).toBe('Updated title')
    })

    it('throws an error when the note is not found', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Note Not Found!' }),
      })
      await expect(updateNote('507f1f77bcf86cd799439099', 'Title', 'Content')).rejects.toThrow(
        'Note Not Found!'
      )
    })


    it('throws an error and never calls fetch when the id is malformed', async () => {
      await expect(updateNote('not-a-valid-id', 'Title', 'Content')).rejects.toThrow('Invalid note ID')
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })
  })

  describe('deleteNote', () => {
    it('sends a DELETE request to the correct note id', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Note deleted successfully!' }),
      })

      await deleteNote('507f1f77bcf86cd799439011')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/507f1f77bcf86cd799439011'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('throws an error and never calls fetch when the id is malformed', async () => {
      await expect(deleteNote('not-a-valid-id')).rejects.toThrow('Invalid note ID')
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })

    it('throws an error when the server rejects the delete', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Note Not Found!' }),
      })

      await expect(deleteNote('507f1f77bcf86cd799439011')).rejects.toThrow('Note Not Found!')
    })


    it('wraps a non-Error rejection when fetch itself fails', async () => {
      ;(globalThis.fetch as jest.Mock).mockRejectedValueOnce('network down')

      await expect(deleteNote('507f1f77bcf86cd799439011')).rejects.toThrow('Something went wrong!')
    })
  })


  describe('getTrash', () => {
    it('returns trashed notes on success', async () => {
      const mockTrash = [{ _id: '3', title: 'Deleted note', content: '', createdAt: '', updatedAt: '' }]

      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrash,
      })

      const result = await getTrash()

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/trash'),
        expect.objectContaining({ method: 'GET', credentials: 'include' })
      )
      expect(result).toEqual(mockTrash)
    })

    it('throws an error when the request fails', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not Authorized!' }),
      })

      await expect(getTrash()).rejects.toThrow('Not Authorized!')
    })
  })

  describe('restoreNote', () => {
    it('restores the note and returns the updated list', async () => {
      const mockNotes = [{ _id: '507f1f77bcf86cd799439011', title: 'Restored', content: '', createdAt: '', updatedAt: '' }]

      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotes,
      })

      const result = await restoreNote('507f1f77bcf86cd799439011')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/507f1f77bcf86cd799439011/restore'),
        expect.objectContaining({ method: 'PATCH', credentials: 'include' })
      )
      expect(result).toEqual(mockNotes)
    })


    it('throws an error when the server rejects the restore', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Note Not Found!' }),
      })

      await expect(restoreNote('507f1f77bcf86cd799439011')).rejects.toThrow('Note Not Found!')
    })

    it('wraps a non-Error rejection when fetch itself fails', async () => {
      ;(globalThis.fetch as jest.Mock).mockRejectedValueOnce('network down')

      await expect(restoreNote('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Something went wrong. Please try again.'
      )
    })
  })

  describe('permanentlyDeleteNote', () => {
    it('permanently deletes the note', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Note permanently deleted!' }),
      })

      const result = await permanentlyDeleteNote('507f1f77bcf86cd799439011')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/507f1f77bcf86cd799439011/permanent'),
        expect.objectContaining({ method: 'DELETE', credentials: 'include' })
      )
      expect(result.message).toBe('Note permanently deleted!')
    })
  })
})