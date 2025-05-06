import { useState, useEffect } from 'react'
import { FiClock, FiBookOpen } from 'react-icons/fi'
import { BsCardChecklist } from 'react-icons/bs'
import Layout from '../components/Layout'
import '../App.css'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createExam, getQuestions } from '../api/admin.api'


const subjects = ["Mathematics", "English", "Physics", "Biology", "Geography"];
const levels = ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5A","Form 5Sc", "LSA", "LSS", "USA", "USS"];

interface Question {
  _id: string;
  question: string;
  subject: string;
  level: string[];
  topic: string;
}

interface ExamPayload {
  title: string;
  subject: string;
  level: string;
  questions: string[];
  duration: number;
}

function CreateExam() {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [level, setLevel] = useState("")
  const [topic, setTopic] = useState("")
  const [duration, setDuration] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [availableTopics, setAvailableTopics] = useState<string[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [successMessage, setSuccessMessage] = useState<string>("")

  // Fetch questions from backend
  const { data: questionsBank = [], isLoading: isQuestionsLoading } = useQuery<Question[]>({
    queryKey: ['questionsBank'],
    queryFn: getQuestions
  })

  // Update available topics when subject or level changes
  useEffect(() => {
    if (subject && level) {
      const topics = [...new Set(
        questionsBank
          .filter((q) => q.subject === subject && q.level && q.level.includes(level))
          .map((q) => q.topic)
      )]
      setAvailableTopics(topics)
    } else {
      setAvailableTopics([])
    }
    setTopic("") // Reset topic when subject or level changes
  }, [subject, level, questionsBank])

  // Filter questions based on selection
  useEffect(() => {
    let filtered = questionsBank
    if (subject) {
      filtered = filtered.filter((q) => q.subject === subject)
    }
    if (level) {
      filtered = filtered.filter((q) => q.level && q.level.includes(level))
    }
    if (topic) {
      filtered = filtered.filter((q) => q.topic === topic)
    }
    setFilteredQuestions(filtered)
  }, [subject, level, topic, questionsBank])

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  // useMutation for creating exam
  const createExamMutation = useMutation({
    mutationFn: async (examData: ExamPayload) => createExam(examData),
    onSuccess: () => {
      setSuccessMessage('Exam created successfully!')
      // Optionally reset form or redirect
    },
    onError: (error) => {
      setSuccessMessage('Error creating exam')
      console.error(error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("")
    createExamMutation.mutate({
      title,
      subject,
      level,
      questions: selectedQuestions,
      duration: parseInt(duration)
    });
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Create Exam</h1>
            <p className="text-gray-400">Form 1</p>
          </div>
        </div>

        {/* Success Message UI */}
        {successMessage && (
          <div className={`mb-6 p-4 rounded-lg text-center font-semibold ${successMessage.includes('success') ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm opacity-90 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-blue-500 text-white placeholder-blue-200 border-blue-400 rounded px-3 py-2"
                    placeholder="Enter exam title"
                    required
                  />
                </div>
                <FiBookOpen className="text-4xl opacity-80" />
              </div>
            </div>

            <div className="bg-blue-500 rounded-xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm opacity-90 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-blue-400 text-white placeholder-blue-200 border-blue-400 rounded px-3 py-2"
                    placeholder="Enter duration"
                    required
                  />
                </div>
                <FiClock className="text-4xl opacity-80" />
              </div>
            </div>

            <div className="bg-blue-400 rounded-xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="w-full">
                  <label className="block text-sm opacity-90 mb-1">Selected Questions</label>
                  <div className="text-4xl font-bold">{selectedQuestions.length}</div>
                  <p className="text-sm opacity-90">Questions selected</p>
                </div>
                <BsCardChecklist className="text-4xl opacity-80" />
              </div>
            </div>
          </div>

          {/* Subject, Level, and Topic Selection */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-[#1a1f2d] p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-white">Subject</h3>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#2a2f3d] text-white border border-gray-700 rounded px-3 py-2"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#1a1f2d] p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-white">Level</h3>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#2a2f3d] text-white border border-gray-700 rounded px-3 py-2"
                required
              >
                <option value="">Select Level</option>
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#1a1f2d] p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-white">Topic (Optional)</h3>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#2a2f3d] text-white border border-gray-700 rounded px-3 py-2"
                disabled={!subject || !level}
              >
                <option value="">All Topics</option>
                {availableTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions Bank */}
          <div className="bg-[#1a1f2d] p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Questions Bank</h3>
              <div className="text-sm text-gray-400">
                {selectedQuestions.length} questions selected
              </div>
            </div>
            <div className="space-y-4">
              {isQuestionsLoading ? (
                <div className="text-white">Loading questions...</div>
              ) : (
                filteredQuestions.map((question) => (
                  <div
                    key={question._id}
                    className={`p-4 rounded-lg border ${
                      selectedQuestions.includes(question._id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question._id)}
                        onChange={() => handleQuestionToggle(question._id)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="text-white mb-2">{question.question}</p>
                        <div className="flex space-x-2">
                          <span className="text-sm text-blue-400">{question.subject}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-400">{question.level.join(', ')}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-blue-400">{question.topic}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={createExamMutation.isPending}
            >
              {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default CreateExam
