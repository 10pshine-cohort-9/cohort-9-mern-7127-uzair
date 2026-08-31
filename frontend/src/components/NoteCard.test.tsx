import { render, screen, fireEvent } from '@testing-library/react'
import NoteCard from './NoteCard'
import type { Note } from './NoteCard'

const mockNote: Note = {
  _id: '1',
  title: 'Grocery run',
  content: '<p>Milk, <strong>eggs</strong>, and bread</p>',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('NoteCard', () => {
  it('renders the title and content', () => {
    render(<NoteCard note={mockNote} isSelected={false} onClick={() => {}} />)
    expect(screen.getByText('Grocery run')).toBeInTheDocument()
    expect(screen.getByText('eggs')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<NoteCard note={mockNote} isSelected={false} onClick={handleClick} />)
    fireEvent.click(screen.getByText('Grocery run'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies selected styling when isSelected is true', () => {
    render(<NoteCard note={mockNote} isSelected={true} onClick={() => {}} />)
    expect(screen.getByRole('button').className).toContain('bg-[#C0453A]')
  })
})