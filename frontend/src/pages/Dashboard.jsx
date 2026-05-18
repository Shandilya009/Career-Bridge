import React from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to CareerBridge!</p>
      <button 
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  )
}

export default Dashboard
