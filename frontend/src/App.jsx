import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CreatePoll from './pages/CreatePoll'
import PollView from './pages/PollView'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePoll />} />
          <Route path="/poll/:pollId" element={<PollView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App