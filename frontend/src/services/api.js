import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const createPoll = async (pollData) => {
  const response = await api.post('/polls/', pollData)
  return response.data
}

export const getPoll = async (pollId, fingerprint) => {
  const response = await api.get(`/polls/${pollId}/`, {
    params: { fingerprint }
  })
  return response.data
}

export const votePoll = async (pollId, voteData) => {
  const response = await api.post(`/polls/${pollId}/vote/`, voteData)
  return response.data
}

export default api