import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-hero">
          <h1 className="home-title">
            Real-Time
            <span className="home-title-accent">Poll Rooms</span>
          </h1>
          <p className="home-subtitle">
            Create instant polls and watch votes roll in live
          </p>
        </div>

        <div className="home-actions">
          <button 
            className="btn btn-primary btn-large"
            onClick={() => navigate('/create')}
          >
            Create New Poll
          </button>
        </div>

        <div className="home-features">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Updates</h3>
            <p>See results update instantly as votes come in</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔗</div>
            <h3>Easy Sharing</h3>
            <p>Share polls with a simple link</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🛡️</div>
            <h3>Fair Voting</h3>
            <p>Built-in protection against duplicate votes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home