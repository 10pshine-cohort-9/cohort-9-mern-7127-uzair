import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'
import SignUp from './SignUp'
import { login, signup } from '../services/authService'

jest.mock('../services/authService', () => ({
  login: jest.fn(),
  signup: jest.fn(),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const renderPage = (Component: React.ComponentType) =>
  render(<MemoryRouter><Component /></MemoryRouter>)

describe('Login', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('logs in successfully and navigates to the dashboard', async () => {
    ;(login as jest.Mock).mockResolvedValueOnce({ message: 'Login Successful!' })
    renderPage(Login)

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'm.uzair@gmail.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(login).toHaveBeenCalledWith('m.uzair@gmail.com', 'password123'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows an error message when login fails', async () => {
    ;(login as jest.Mock).mockRejectedValueOnce(new Error('Invalid Credentials'))
    renderPage(Login)

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'm.uzair@gmail.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Invalid Credentials')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('SignUp', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('signs up successfully and navigates to the dashboard', async () => {
    ;(signup as jest.Mock).mockResolvedValueOnce({ message: 'User registered successfully' })
    renderPage(SignUp)

    fireEvent.change(screen.getByPlaceholderText('Full name'), {
      target: { value: 'Ali Ahmed' },
    })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'ali.ahmed@yahoo.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'blueMountain7' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() =>
      expect(signup).toHaveBeenCalledWith('Ali Ahmed', 'ali.ahmed@yahoo.com', 'blueMountain7')
    )
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows an error message when signup fails', async () => {
    ;(signup as jest.Mock).mockRejectedValueOnce(new Error('User already exists'))
    renderPage(SignUp)

    fireEvent.change(screen.getByPlaceholderText('Full name'), {
      target: { value: 'Ali Ahmed' },
    })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'ali.ahmed@yahoo.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'blueMountain7' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('User already exists')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})