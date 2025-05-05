import { Routes, Route, Navigate } from 'react-router-dom'
import AdminHome from './pages/AdminHome'
import CreateExam from './pages/CreateExam'
import Students from './pages/Students'
import AddQuestions from './pages/AddQuestions'
import AddQuestionsInBulk from './pages/AddQuestionsInBulk'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home/:class" element={<AdminHome />} />
      <Route path="/create-exam" element={<CreateExam />} />
      <Route path="/students/:class" element={<Students />} />
      <Route path="/add-question" element={<AddQuestions />} />
      <Route path="/add-questions-bulk" element={<AddQuestionsInBulk />} />
    </Routes>
  )
}

export default App
