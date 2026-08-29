import { login, signup, logout, getMe, getProfile, uploadProfilePicture } from './authService'

describe('authService', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('login', () => {
    it('logs in successfully with correct credentials', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Login Successful!', user: { id: '1', name: 'M Uzair', email: 'm.uzair@gmail.com' } }),
      })

      const result = await login('m.uzair@gmail.com', 'password123')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      )
      expect(result.user.email).toBe('m.uzair@gmail.com')
    })

    it('throws an error on invalid credentials', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid Credentials' }),
      })

      await expect(login('m.uzair@gmail.com', 'wrongpass')).rejects.toThrow('Invalid Credentials')
    })
  })

  describe('signup', () => {
    it('signs up successfully with valid data', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'User registered successfully', user: { id: '2', name: 'Ali Ahmed', email: 'ali.ahmed@yahoo.com' } }),
      })

      const result = await signup('Ali Ahmed', 'ali.ahmed@yahoo.com', 'blueMountain7')

      expect(result.user.name).toBe('Ali Ahmed')
    })

    it('throws an error when the email is already registered', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User already exists' }),
      })

      await expect(signup('Ali Ahmed', 'ali.ahmed@yahoo.com', 'blueMountain7')).rejects.toThrow(
        'User already exists'
      )
    })


    it('rethrows the original error when fetch itself rejects with an Error', async () => {
      ;(globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network down'))

      await expect(signup('Ali Ahmed', 'ali.ahmed@yahoo.com', 'blueMountain7')).rejects.toThrow(
        'Network down'
      )
    })


    it('wraps a non-Error rejection in a generic error', async () => {
      ;(globalThis.fetch as jest.Mock).mockRejectedValueOnce('some string failure')

      await expect(signup('Ali Ahmed', 'ali.ahmed@yahoo.com', 'blueMountain7')).rejects.toThrow(
        'Something went wrong!'
      )
    })
  })

  describe('logout', () => {
    it('resolves without throwing when logout succeeds', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      })

      await expect(logout()).resolves.toBeUndefined()

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/logout'),
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      )
    })

    it('throws an error when the server responds with a failure', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Session already expired' }),
      })

      await expect(logout()).rejects.toThrow('Session already expired')
    })
  })

  describe('getMe', () => {
    it('returns true when the session is valid', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      })

      const result = await getMe()

      expect(result).toBe(true)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({ method: 'GET', credentials: 'include' })
      )
    })

    it('throws when fetch itself rejects', async () => {
      ;(globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Timed out'))

      await expect(getMe()).rejects.toThrow('Timed out')
    })
  })

  describe('getProfile', () => {
    it('returns the logged-in user profile data', async () => {
      const mockProfile = { name: 'M Uzair', email: 'm.uzair@gmail.com', profilePicture: '' }

      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      })

      const result = await getProfile()
      expect(result).toEqual(mockProfile)
    })

    it('throws an error when not authorized', async () => {
      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not Authorized!' }),
      })

      await expect(getProfile()).rejects.toThrow('Not Authorized!')
    })
  })

  describe('uploadProfilePicture', () => {
    it('uploads a file and returns the updated profile', async () => {
      const mockProfile = { name: 'M Uzair', email: 'm.uzair@gmail.com', profilePicture: '/uploads/123.webp' }

      ;(globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      })

      const fakeFile = new File(['fake image content'], 'photo.jpg', { type: 'image/jpeg' })
      const result = await uploadProfilePicture(fakeFile)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/profile-picture'),
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      )
      expect(result.profilePicture).toBe('/uploads/123.webp')
    })
  })
})