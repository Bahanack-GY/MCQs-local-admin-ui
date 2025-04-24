import { Routes, Route } from 'react-router-dom'
import AdminHome from './pages/AdminHome'
import CreateExam from './pages/CreateExam'
import Students from './pages/Students'
import AddQuestions from './pages/AddQuestions'
import AddQuestionsInBulk from './pages/AddQuestionsInBulk'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      <Route path="/create-exam" element={<CreateExam />} />
      <Route path="/students" element={<Students />} />
      <Route path="/add-question" element={<AddQuestions />} />
      <Route path="/add-questions-bulk" element={<AddQuestionsInBulk />} />
    </Routes>
  )
}

export default App
