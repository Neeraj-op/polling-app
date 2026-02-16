import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPoll } from '../services/api'
import './CreatePoll.css'

function CreatePoll() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    const validOptions = options.filter(opt => opt.trim() !== '')
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options')
      return
    }

    setLoading(true)

    try {
      const pollData = {
        question: question.trim(),
        options: validOptions.map(text => ({ text: text.trim() })),
        is_active: true
      }

      const createdPoll = await createPoll(pollData)
      navigate(`/poll/${createdPoll.id}`)
    } catch (err) {
      setError('Failed to create poll. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-poll">
      <div className="create-poll-container">
        <div className="create-poll-header">
          <button 
            className="btn-back"
            onClick={() => navigate('/')}
          >
            ← Back
          </button>
          <h1>Create New Poll</h1>
        </div>

        <form onSubmit={handleSubmit} className="poll-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="question">Your Question</label>
            <input
              id="question"
              type="text"
              className="form-input"
              placeholder="What's your question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label>Options</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  maxLength={200}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveOption(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {options.length < 10 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddOption}
              >
                + Add Option
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreatePoll