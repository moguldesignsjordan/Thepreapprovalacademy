import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import PreApprovalAcademy from './pages/PreApprovalAcademy'
import AdminDashboard from './pages/AdminDashboard'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="w-full min-h-screen">
          <Routes>
            <Route path="/*" element={<PreApprovalAcademy />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
