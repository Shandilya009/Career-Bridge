import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Auth pages
import Login        from './pages/Login'
import Register     from './pages/Register'
import Unauthorized from './pages/Unauthorized'
import NotFound     from './pages/NotFound'

// Shared pages
import Jobs            from './pages/Jobs'
import JobDetail       from './pages/JobDetail'
import Notifications   from './pages/Notifications'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile   from './pages/student/StudentProfile'
import Applications     from './pages/student/Applications'

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Layout & Routes
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute  from './routes/ProtectedRoute'

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/jobs"     element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute roles={['Student']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/student/dashboard"    element={<StudentDashboard />} />
          <Route path="/student/profile"      element={<StudentProfile />} />
          <Route path="/student/applications" element={<Applications />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute roles={['Recruiter']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={['Admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
