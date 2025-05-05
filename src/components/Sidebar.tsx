import { Link, useLocation, useParams } from 'react-router-dom'
import { FiHome, FiUsers, FiBook, FiCalendar, FiSettings } from 'react-icons/fi'
import { BsBookHalf, BsPencilSquare } from 'react-icons/bs'
import { IconType } from 'react-icons'
import { useTheme } from '../context/ThemeContext'
import { IoClose } from 'react-icons/io5'

interface NavigationItem {
  path: string;
  icon: IconType;
  label: string;
}

interface SidebarProps {
  navigation?: NavigationItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

const defaultNavItems: NavigationItem[] = [
  { path: '/home', icon: FiHome, label: 'Dashboard' },
  { path: '/students', icon: FiUsers, label: 'Student' },
  { path: '/create-exam', icon: BsPencilSquare, label: 'Create Exam' },
  { path: '/courses', icon: FiBook, label: 'Courses' },
  { path: '/meetings', icon: FiCalendar, label: 'Meetings' },
  { path: '/homeworks', icon: BsBookHalf, label: 'Homeworks' },
  { path: '/settings', icon: FiSettings, label: 'Settings' },
]

function Sidebar({ navigation = defaultNavItems, isOpen = false, onClose }: SidebarProps) {
  const location = useLocation()
  const { darkMode } = useTheme()
  const { class: selectedClass } = useParams()

  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-30 overflow-y-auto
        w-64 transform transition-transform duration-300 ease-in-out
        ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          <div className="text-2xl font-bold text-blue-500">SSIC.</div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 px-2 pb-4 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const path = item.path === '/home' && selectedClass 
              ? `${item.path}/${selectedClass}` 
              : item.path
            const isActive = location.pathname === path
            
            return (
              <Link
                key={item.path}
                to={path}
                onClick={onClose}
                className={`
                  flex items-center gap-x-3 px-3 py-2 rounded-lg transition-all duration-200 relative
                  ${isActive
                    ? 'text-white'
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg -z-10" />
                )}
                <Icon className={`w-5 h- ${isActive ? 'text-white' : ''}`} />
                <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar 