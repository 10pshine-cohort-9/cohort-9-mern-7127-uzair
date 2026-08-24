import type { JSX } from 'react'
import { Link } from 'react-router-dom'

const NotFound = (): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-8">
      <h1 className="text-4xl font-bold text-[#1D2939] mb-2">404</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist.</p>
      <Link to="/dashboard" className="text-[#C0453A] font-medium">
        Back to Dashboard
      </Link>
    </div>
  )
}

export default NotFound;