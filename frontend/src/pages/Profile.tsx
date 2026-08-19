import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { getProfile, uploadProfilePicture } from '../services/authService'
import Sidebar from '../components/Sidebar'

type UserProfile = {
  name: string
  email: string
  profilePicture: string
}

const Profile = (): JSX.Element => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile()
        setProfile(data)
      } catch (error) {
        if (error instanceof Error && error.message === "Not Authorized!") {
          navigate('/login')
          return
        }
        setError(error instanceof Error ? error.message : 'Failed to load profile!')
      }
    }

    loadProfile()
  }, [navigate])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const updated = await uploadProfilePicture(file)
      setProfile(updated)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload photo!')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm bg-[#FAF6EC] rounded-lg shadow-md p-8 text-center">
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          {profile ? (
            <>
              {profile.profilePicture ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${profile.profilePicture}`}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#1D2939] flex items-center justify-center mx-auto mb-4">
                  <User size={40} color="#FAF6EC" />
                </div>
              )}

              <label htmlFor="profilePicture" className="block text-sm text-[#C0453A] font-medium cursor-pointer mb-4">
                {uploading ? 'Uploading...' : profile.profilePicture ? 'Change photo' : 'Add photo'}
              </label>
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <h1 className="text-xl font-semibold text-[#1D2939]">{profile.name}</h1>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile