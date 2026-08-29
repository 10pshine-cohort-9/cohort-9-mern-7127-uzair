import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Profile from './Profile'
import { getProfile, uploadProfilePicture } from '../services/authService'

jest.mock('../services/authService', () => ({
  getProfile: jest.fn(),
  uploadProfilePicture: jest.fn(),
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

const profile = (overrides = {}) => ({
  name: 'M Uzair',
  email: 'm.uzair@gmail.com',
  profilePicture: '',
  ...overrides,
})

// Profile.tsx renders two <input type="file">: Sidebar's import input and
// Profile's own photo upload input. Scope by accept="image/*" to get the right one.
const getPhotoInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement

const renderProfile = () => render(<MemoryRouter><Profile /></MemoryRouter>)

describe('Profile', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('loadProfile', () => {
    it('renders the profile on success', async () => {
      ;(getProfile as jest.Mock).mockResolvedValueOnce(profile())
      renderProfile()

      expect(await screen.findByRole('heading', { name: 'M Uzair' })).toBeInTheDocument()
      expect(screen.getAllByText('m.uzair@gmail.com')).toHaveLength(2)
    })

    it('navigates to /login when not authorized', async () => {
      ;(getProfile as jest.Mock).mockRejectedValueOnce(new Error('Not Authorized!'))
      renderProfile()

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
    })

    it('shows an error message on other failures', async () => {
      ;(getProfile as jest.Mock).mockRejectedValueOnce(new Error('Failed to load profile!'))
      renderProfile()

      expect(await screen.findByText('Failed to load profile!')).toBeInTheDocument()
    })
  })

  describe('handleFileChange', () => {
    it('uploads the selected photo and updates the profile', async () => {
      ;(getProfile as jest.Mock).mockResolvedValueOnce(profile())
      ;(uploadProfilePicture as jest.Mock).mockResolvedValueOnce(profile({ profilePicture: '/x.jpg' }))

      const { container } = renderProfile()
      await screen.findByRole('heading', { name: 'M Uzair' })

      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
      fireEvent.change(getPhotoInput(container), { target: { files: [file] } })

      expect(uploadProfilePicture).toHaveBeenCalledWith(file)
      await waitFor(() => expect(screen.getByRole('img', { name: 'M Uzair' })).toBeInTheDocument())
    })

    it('shows an error message when the upload fails', async () => {
      ;(getProfile as jest.Mock).mockResolvedValueOnce(profile())
      ;(uploadProfilePicture as jest.Mock).mockRejectedValueOnce(new Error('Failed to upload photo!'))

      const { container } = renderProfile()
      await screen.findByRole('heading', { name: 'M Uzair' })

      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
      fireEvent.change(getPhotoInput(container), { target: { files: [file] } })

      expect(await screen.findByText('Failed to upload photo!')).toBeInTheDocument()
    })
  })
})