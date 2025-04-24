import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'
import { HomeIcon, PlusCircleIcon, UsersIcon, QuestionMarkCircleIcon, DocumentPlusIcon } from '@heroicons/react/24/outline'
import { IconType } from 'react-icons'
import { useTheme } from '../context/ThemeContext'
import { BsMoonStars, BsSun } from 'react-icons/bs'
import { HiMenuAlt2 } from 'react-icons/hi'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { path: '/', icon: HomeIcon as unknown as IconType, label: 'Dashboard' },
  { path: '/create-exam', icon: PlusCircleIcon as unknown as IconType, label: 'Create Exam' },
  { path: '/add-question', icon: QuestionMarkCircleIcon as unknown as IconType, label: 'Add Question' },
  { path: '/add-questions-bulk', icon: DocumentPlusIcon as unknown as IconType, label: 'Bulk Upload' },
  { path: '/students', icon: UsersIcon as unknown as IconType, label: 'Students' },
]

function Layout({ children }: LayoutProps) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        navigation={navigation} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <HiMenuAlt2 className="w-5 h-5" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-blue-500/10"
              >
                {darkMode ? (
                  <BsSun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <BsMoonStars className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Page Content */}
            <div className="max-w-[2000px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 