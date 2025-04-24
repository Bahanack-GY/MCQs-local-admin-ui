import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import { FiUpload, FiEdit2, FiCheck, FiDownload } from 'react-icons/fi'
import mammoth from 'mammoth'

interface ParsedQuestion {
  question: string
  options: string[]
  answer: number
  topic: string
  subject: string
  level: string[]
  image?: string | null
}

interface EditingQuestion extends ParsedQuestion {
  isEditing: boolean
}

const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology']
const levels = ['Form 1', 'Form 2', 'Form 3', 'Form 4']

function AddQuestionsInBulk() {
  const { darkMode } = useTheme()
  const [parsedQuestions, setParsedQuestions] = useState<EditingQuestion[]>([])
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const parseFileContent = async (text: string) => {
    try {
      const questions: EditingQuestion[] = []
      const lines = text.split('\n').map(line => line.trim()).filter(line => line)
      
      let currentQuestion: Partial<EditingQuestion> = {
        options: [],
        isEditing: false,
        level: [level]
      }
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        // Check for numbered question start (e.g., "1.", "2.", etc.)
        const questionMatch = line.match(/^\d+\.\s*(.+)/)
        if (questionMatch) {
          // Save previous question if it exists
          if (currentQuestion.question && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) {
            if (isValidQuestion(currentQuestion)) {
              questions.push(currentQuestion as EditingQuestion)
            } else {
              questions.push({
                ...currentQuestion,
                topic: currentQuestion.topic || '',
                options: currentQuestion.options || ['', '', '', ''],
                answer: currentQuestion.answer || 0,
                subject,
                level: [level],
                isEditing: true
              } as EditingQuestion)
            }
          }
          
          // Start new question
          currentQuestion = {
            question: questionMatch[1],
            options: [],
            subject,
            level: [level],
            isEditing: false
          }
          continue
        }
        
        // Check for topic (T.)
        if (line.startsWith('T.')) {
          currentQuestion.topic = line.substring(2).trim()
          continue
        }
        
        // Check for options (A., B., C., D.)
        const optionMatch = line.match(/^([A-D])\.\s*(.+)/)
        if (optionMatch) {
          const [, letter, text] = optionMatch
          const optionIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0)
          const isAnswer = text.endsWith('*')
          const cleanOption = isAnswer ? text.slice(0, -1).trim() : text.trim()
          
          // Ensure options array has enough space
          while ((currentQuestion.options?.length ?? 0) < optionIndex) {
            currentQuestion.options?.push('')
          }
          if (currentQuestion.options) {
            currentQuestion.options[optionIndex] = cleanOption
          }
          
          if (isAnswer) {
            currentQuestion.answer = optionIndex
          }
        }
      }
      
      // Add the last question if it exists
      if (currentQuestion.question && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) {
        if (isValidQuestion(currentQuestion)) {
          questions.push(currentQuestion as EditingQuestion)
        } else {
          questions.push({
            ...currentQuestion,
            topic: currentQuestion.topic || '',
            options: currentQuestion.options || ['', '', '', ''],
            answer: currentQuestion.answer || 0,
            subject,
            level: [level],
            isEditing: true
          } as EditingQuestion)
        }
      }
      
      return questions
    } catch (error) {
      console.error('Error parsing file:', error)
      throw new Error('Failed to parse file content')
    }
  }

  const isValidQuestion = (question: Partial<ParsedQuestion>): boolean => {
    return !!(
      question.question &&
      question.options &&
      question.options.length === 4 &&
      !question.options.includes('') &&
      typeof question.answer === 'number' &&
      question.topic &&
      question.subject &&
      question.level
    )
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    if (!subject || !level) {
      setError('Please select subject and level first')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      let text = ''
      
      if (selectedFile.name.endsWith('.docx')) {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value
      } else if (selectedFile.name.endsWith('.txt')) {
        text = await selectedFile.text()
      } else {
        throw new Error('Unsupported file type')
      }

      const questions = await parseFileContent(text)
      
      if (questions.length === 0) {
        throw new Error('No questions found in the file')
      }
      
      setParsedQuestions(questions)
      setSuccess(`Successfully parsed ${questions.length} questions. ${
        questions.filter(q => q.isEditing).length
      } questions need review.`)
    } catch (error) {
      console.error(error)
      setError('Failed to parse file. Please check the file format.')
      setParsedQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionEdit = (index: number, field: keyof EditingQuestion, value: string | number | { index: number; value: string }) => {
    setParsedQuestions(prev => {
      const updated = [...prev]
      if (field === 'options' && typeof value === 'object') {
        const { index: optionIndex, value: optionValue } = value
        updated[index].options = updated[index].options.map((opt, idx) => 
          idx === optionIndex ? optionValue : opt
        )
      } else if (typeof value === 'string' || typeof value === 'number') {
        if (field === 'level') {
          updated[index] = {
            ...updated[index],
            level: [value as string]
          }
        } else {
          updated[index] = {
            ...updated[index],
            [field]: value
          }
        }
      }
      return updated
    })
  }

  const toggleEditing = (index: number) => {
    setParsedQuestions(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        isEditing: !updated[index].isEditing
      }
      return updated
    })
  }

  const handleExportJSON = () => {
    try {
      // Create a clean version of the questions without the isEditing field
      const exportData = parsedQuestions.map(({ ...question }) => question)
      
      // Create a Blob with the JSON data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'questions.json'
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setSuccess('Questions exported successfully!')
    } catch (error) {
      console.error(error)
      setError('Failed to export questions')
    }
  }

  const handleSubmit = async () => {
    const invalidQuestions = parsedQuestions.filter(q => !isValidQuestion(q))
    if (invalidQuestions.length > 0) {
      setError(`${invalidQuestions.length} questions are incomplete. Please review them.`)
      return
    }

    try {
      // Here you would make the API call to your backend
      console.log('Submitting questions:', parsedQuestions)
      setSuccess('Questions submitted successfully!')
      
      // Reset form
      setParsedQuestions([])
      setSubject('')
      setLevel('')
    } catch (error) {
      console.error(error)
      setError('Failed to submit questions')
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Add Questions in Bulk
        </h1>

        <div className="space-y-6">
          {/* Subject and Level Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
              <label className="block mb-2 text-sm font-medium text-gray-400">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full p-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Subject</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
              <label className="block mb-2 text-sm font-medium text-gray-400">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={`w-full p-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Level</option>
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-400">
                Upload Questions File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${
                  darkMode 
                    ? 'border-gray-600 hover:border-gray-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className={`w-10 h-10 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`mb-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      DOCX or TXT files
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {parsedQuestions.length > 0 && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Preview ({parsedQuestions.length} questions)
                </h2>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <FiDownload className="w-5 h-5" />
                  <span>Export JSON</span>
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${
                    q.isEditing
                      ? darkMode ? 'bg-gray-700 border-2 border-blue-500' : 'bg-white border-2 border-blue-500'
                      : darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        {q.isEditing ? (
                          <textarea
                            value={q.question}
                            onChange={(e) => handleQuestionEdit(idx, 'question', e.target.value)}
                            className={`w-full p-2 rounded-lg ${
                              darkMode 
                                ? 'bg-gray-600 text-white border-gray-500' 
                                : 'bg-gray-50 text-gray-900 border-gray-300'
                            } border focus:ring-2 focus:ring-blue-500`}
                            rows={2}
                          />
                        ) : (
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {idx + 1}. {q.question}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleEditing(idx)}
                        className={`ml-4 p-2 rounded-lg ${
                          q.isEditing
                            ? 'text-green-500 hover:bg-green-500/10'
                            : 'text-blue-500 hover:bg-blue-500/10'
                        }`}
                      >
                        {q.isEditing ? <FiCheck size={20} /> : <FiEdit2 size={20} />}
                      </button>
                    </div>

                    {q.isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleQuestionEdit(idx, 'options', { index: optIdx, value: e.target.value })}
                                  className={`w-full p-2 rounded-lg ${
                                    darkMode 
                                      ? 'bg-gray-600 text-white border-gray-500' 
                                      : 'bg-gray-50 text-gray-900 border-gray-300'
                                  } border focus:ring-2 focus:ring-blue-500`}
                                />
                              </div>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`answer-${idx}`}
                                  checked={q.answer === optIdx}
                                  onChange={() => handleQuestionEdit(idx, 'answer', optIdx)}
                                  className="text-blue-500"
                                />
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Correct Answer
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Topic
                          </label>
                          <input
                            type="text"
                            value={q.topic}
                            onChange={(e) => handleQuestionEdit(idx, 'topic', e.target.value)}
                            className={`w-full p-2 rounded-lg ${
                              darkMode 
                                ? 'bg-gray-600 text-white border-gray-500' 
                                : 'bg-gray-50 text-gray-900 border-gray-300'
                            } border focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded ${
                                q.answer === optIdx
                                  ? 'bg-blue-500 text-white'
                                  : darkMode
                                  ? 'bg-gray-600 text-gray-300'
                                  : 'bg-white text-gray-700'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Topic: {q.topic}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Submit Button */}
          {parsedQuestions.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : 'Submit Questions'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default AddQuestionsInBulk
