import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { PiGraduationCapBold, PiChalkboardTeacherBold } from 'react-icons/pi'
import Layout from '../components/Layout'
import { useTheme } from '../context/ThemeContext'
import '../App.css'
import { useQuery } from '@tanstack/react-query'
import { getCardData } from '../api/admin.api'
// import { useParams } from 'react-router-dom'
const managementData = [
  { week: 'Week1', value: 45 },
  { week: 'Week2', value: 42 },
  { week: 'Week3', value: 75 },
  { week: 'Week4', value: 55 },
  { week: 'Week5', value: 45 },
  { week: 'Week6', value: 50 },
]

const subjectData = [
  { subject: 'Integration', percentage: 85 },
  { subject: 'Differential Calculus', percentage: 92 },
  { subject: 'Integral Calculus', percentage: 75 },
  { subject: 'Probability', percentage: 60 },
  { subject: 'Statistics', percentage: 96 },
]
const currentUrl: string = window.location.href; // Full current URL
const urlSegments: string[] = currentUrl.split("/");
const classLevel = urlSegments[urlSegments.length - 1];
const classLevelNumber = classLevel.replace('%20', ' ');
function AdminHome() {
  const { darkMode } = useTheme();

  const { data: cardData, isLoading } = useQuery({
    queryKey: ['cardData'],
    queryFn: () => getCardData(classLevel),
    staleTime: 5000,
    
  })
 if(isLoading){
  return <div>...</div>
 }
  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-400">{classLevelNumber}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-blue-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{cardData?.totalStudents}</h3>
                <p className="text-sm sm:text-base">Students</p>
              </div>
              <PiGraduationCapBold className="text-3xl sm:text-4xl opacity-80" />
            </div>
          </div>
          <div className="bg-blue-500 rounded-xl p-4 sm:p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{cardData?.highestScore} %</h3>
                <p className="text-sm sm:text-base">Highest score</p>
              </div>
              <PiChalkboardTeacherBold className="text-3xl sm:text-4xl opacity-80" />
            </div>
          </div>
          <div className="bg-blue-400 rounded-xl p-4 sm:p-6 text-white sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{cardData?.lowestScore} %</h3>
                <p className="text-sm sm:text-base">Lowest score</p>
              </div>
              <PiChalkboardTeacherBold className="text-3xl sm:text-4xl opacity-80" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Management Value Chart */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-lg`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Management Value
            </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={managementData}>
                  <XAxis 
                    dataKey="week" 
                    stroke={darkMode ? '#94a3b8' : '#64748b'} 
                    fontSize={12}
                    tickMargin={8}
                  />
                  <YAxis 
                    stroke={darkMode ? '#94a3b8' : '#64748b'} 
                    fontSize={12}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Tasks */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-lg`}>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Topic 
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {subjectData.map((item) => (
                <div key={item.subject}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.subject}
                    </span>
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 sm:h-2`}>
                    <div
                      className="bg-blue-500 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminHome
