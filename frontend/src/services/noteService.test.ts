import { getNotes, createNote, updateNote, deleteNote } from './noteService'

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
      await expect(updateNote('507f1f77bcf86cd799439099', 'Title', 'Content')).rejects.toThrow('Note Not Found!')
    })
    })
})