import { login, signup, getProfile, uploadProfilePicture } from './authService'

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