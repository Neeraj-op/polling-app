import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPoll, votePoll } from '../services/api'
import { getStoredFingerprint } from '../utils/fingerprint'
import websocketService from '../services/websocket'
import './PollView.css'

function PollView() {
  const { pollId } = useParams()
  const navigate = useNavigate()
  const [poll, setPoll] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadPoll()
    
    // Connect to WebSocket
    websocketService.connect(pollId)
    
    // Subscribe to updates
    const unsubscribe = websocketService.subscribe((data) => {
      if (data.type === 'poll_update' || data.type === 'poll_data') {
        setPoll(data.poll)
      }
    })

    return () => {
      unsubscribe()
      websocketService.disconnect()
    }
  }, [pollId])

  useEffect(() => {
    setShareLink(window.location.href)
  }, [])

  const loadPoll = async () => {
    try {
      const fingerprint = getStoredFingerprint()
      const data = await getPoll(pollId, fingerprint)
      setPoll(data)
      setHasVoted(data.has_voted)
      setLoading(false)
    } catch (err) {
      setError('Poll not found')
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedOption || hasVoted) return

    setVoting(true)
    setError('')

    try {
      const fingerprint = getStoredFingerprint()
      const updatedPoll = await votePoll(pollId, {
        option_id: selectedOption,
        voter_fingerprint: fingerprint
      })
      
      setPoll(updatedPoll)
      setHasVoted(true)
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Failed to submit vote. Please try again.')
      }
    } finally {
      setVoting(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getPercentage = (voteCount) => {
    if (!poll || poll.total_votes === 0) return 0
    return Math.round((voteCount / poll.total_votes) * 100)
  }

  if (loading) {
    return (
      <div className="poll-view loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error && !poll) {
    return (
      <div className="poll-view error">
        <div className="error-container">
          <h2>😕 {error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="poll-view">
      <div className="poll-container">
        <div className="poll-header">
          <button 
            className="btn-back"
            onClick={() => navigate('/')}
          >
            ← Back
          </button>
          
          <div className="share-section">
            <div className="share-input-group">
              <input 
                type="text" 
                className="share-input"
                value={shareLink}
                readOnly
              />
              <button 
                className="btn btn-secondary"
                onClick={handleCopyLink}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        <div className="poll-content">
          <h1 className="poll-question">{poll?.question}</h1>
          
          {error && <div className="error-message">{error}</div>}

          <div className="poll-stats">
            <span className="total-votes">
              {poll?.total_votes || 0} {poll?.total_votes === 1 ? 'vote' : 'votes'}
            </span>
            {hasVoted && (
              <span className="voted-badge">✓ You voted</span>
            )}
          </div>

          <div className="options-list">
            {poll?.options.map((option) => (
              <div 
                key={option.id}
                className={`option-card ${
                  hasVoted ? 'voted' : ''
                } ${
                  selectedOption === option.id ? 'selected' : ''
                }`}
                onClick={() => !hasVoted && setSelectedOption(option.id)}
              >
                <div className="option-content">
                  <div className="option-text">
                    {!hasVoted && (
                      <input
                        type="radio"
                        name="poll-option"
                        checked={selectedOption === option.id}
                        onChange={() => setSelectedOption(option.id)}
                        disabled={hasVoted}
                      />
                    )}
                    <span>{option.text}</span>
                  </div>
                  
                  {hasVoted && (
                    <div className="option-stats">
                      <span className="vote-count">{option.vote_count}</span>
                      <span className="vote-percentage">{getPercentage(option.vote_count)}%</span>
                    </div>
                  )}
                </div>
                
                {hasVoted && (
                  <div 
                    className="option-bar"
                    style={{ width: `${getPercentage(option.vote_count)}%` }}
                  />
                )}
              </div>
            ))}
          </div>

          {!hasVoted && (
            <button
              className="btn btn-primary btn-large"
              onClick={handleVote}
              disabled={!selectedOption || voting}
            >
              {voting ? 'Submitting...' : 'Submit Vote'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PollView