import type { JSX } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Camera } from 'lucide-react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
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

      <div className="flex-1 flex flex-col overflow-y-auto">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-6 py-2">{error}</p>
        )}

        {profile ? (
          <>
            <div className="h-56 bg-linear-to-br from-[#1D2939] to-[#0F1621] relative shrink-0 overflow-hidden">
              <div className="absolute w-96 h-96 bg-[#C0453A]/20 rounded-full blur-3xl -top-20 -right-20" />
              <div className="absolute w-64 h-64 bg-white/5 rounded-full blur-3xl -bottom-32 left-1/4" />
            </div>

            <div className="flex-1 px-8 md:px-16 pb-16">
              <div className="-mt-16 flex flex-col items-center">
                <div className="relative group">
                  {profile.profilePicture ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${profile.profilePicture}`}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-[#1D2939] flex items-center justify-center ring-4 ring-white shadow-lg">
                      <User size={50} color="#FAF6EC" />
                    </div>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera size={24} color="white" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {uploading && (
                  <p className="text-xs text-gray-400 mt-2">Uploading...</p>
                )}

                <h1 className="text-2xl font-semibold text-[#1D2939] mt-4">{profile.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
              </div>

              <div className="max-w-2xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 px-5 py-4 bg-[#FAF6EC] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <User size={18} color="#C0453A" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Full name</p>
                    <p className="text-sm text-[#1D2939] font-medium">{profile.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-5 py-4 bg-[#FAF6EC] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <Mail size={18} color="#C0453A" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email address</p>
                    <p className="text-sm text-[#1D2939] font-medium">{profile.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center mt-20">Loading...</p>
        )}
      </div>
    </div>
  )
}

export default Profile