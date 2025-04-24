import { useState, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'
import { IoAdd, IoClose } from 'react-icons/io5'
import { BsInfoCircle } from 'react-icons/bs'

interface QuestionForm {
  question: string
  options: string[]
  answer: string
  topic: string
  subject: string
  image?: File | null
  level: string
}

const initialForm: QuestionForm = {
  question: '',
  options: ['', '', '', ''],
  answer: '',
  topic: '',
  subject: '',
  image: null,
  level: ''
}

const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology']
const levels = ['Form 1', 'Form 2', 'Form 3', 'Form 4']

function AddQuestions() {
  const { darkMode } = useTheme()
  const [formData, setFormData] = useState<QuestionForm>(initialForm)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      setFormData(prev => ({ ...prev, image: file }))
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleAddOption = () => {
    if (formData.options.length < 4) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }))
    }
  }

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.question.trim()) {
      setError('Question is required')
      return
    }
    if (!formData.subject) {
      setError('Subject is required')
      return
    }
    if (!formData.level) {
      setError('Level is required')
      return
    }
    if (!formData.topic.trim()) {
      setError('Topic is required')
      return
    }
    if (!formData.answer.trim()) {
      setError('Correct answer is required')
      return
    }
    if (formData.options.some(opt => !opt.trim())) {
      setError('All options must be filled')
      return
    }

    const answerNum = parseInt(formData.answer)
    if (isNaN(answerNum) || answerNum < 0 || answerNum >= formData.options.length) {
      setError(`Answer must be a number between 0 and ${formData.options.length - 1}`)
      return
    }

    // Here you would typically make an API call to your backend
    console.log('Form submitted:', {
      ...formData,
      image: formData.image ? formData.image.name : null
    })
    setSuccess('Question added successfully!')
    setFormData(initialForm)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('')
    }, 3000)
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Add New Question
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Input */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Question
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500`}
              rows={3}
              placeholder="Enter your question here..."
            />
          </div>

          {/* Options */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-400">
                Options
              </label>
              {formData.options.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                >
                  <IoAdd className="text-lg" />
                  Add Option
                </button>
              )}
            </div>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-gray-400 min-w-[24px]">{index}.</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={`flex-1 p-3 rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-gray-50 text-gray-900 border-gray-300'
                    } border focus:ring-2 focus:ring-blue-500`}
                    placeholder={`Option ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-3 text-gray-400 hover:text-red-500"
                    >
                      <IoClose className="text-lg" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Correct Answer
              </label>
              <div className="group relative">
                <BsInfoCircle className="text-gray-400 hover:text-blue-500 cursor-help" />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  Enter the number (0-{formData.options.length - 1}) corresponding to the correct option
                </div>
              </div>
            </div>
            <input
              type="number"
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              min={0}
              max={formData.options.length - 1}
              className={`w-full p-3 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500`}
              placeholder={`Enter a number between 0 and ${formData.options.length - 1}`}
            />
          </div>

          {/* Subject and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
              <label className="block mb-2 text-sm font-medium text-gray-400">
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
              <label className="block mb-2 text-sm font-medium text-gray-400">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Topic
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter the topic..."
            />
          </div>

          {/* Image Upload */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <label className="block mb-2 text-sm font-medium text-gray-400">
              Image (Optional)
            </label>
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-4 border-2 border-dashed rounded-lg text-center ${
                  darkMode
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-gray-400">Click to upload image (max 5MB)</span>
              </button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-40 rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('')
                      setFormData(prev => ({ ...prev, image: null }))
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <IoClose />
                  </button>
                </div>
              )}
            </div>
          </div>

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
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Add Question
          </button>
        </form>
      </div>
    </Layout>
  )
}

export default AddQuestions
