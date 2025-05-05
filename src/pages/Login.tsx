import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { PiChalkboardTeacher } from 'react-icons/pi'

const classes = [
  "Form 1",
  "Form 2",
  "Form 3",
  "Form 4"
]

function Login() {
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedClass) {
      // Navigate to home page with the selected class
      navigate(`/home/${selectedClass}`)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`w-full max-w-md p-8 space-y-8 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <PiChalkboardTeacher className={`w-12 h-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Teacher Login
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select your class to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="class" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Class
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
                required
              >
                <option value="">Choose a class</option>
                {classes.map((classOption) => (
                  <option key={classOption} value={classOption}>
                    {classOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!selectedClass}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
