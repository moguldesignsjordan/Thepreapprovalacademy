import { ThemeProvider } from './ThemeContext'
import PreApprovalAcademy from './PreApprovalAcademy'

function App() {
  return (
    <ThemeProvider>
      <div className="w-full min-h-screen">
        <PreApprovalAcademy />
      </div>
    </ThemeProvider>
  )
}

export default App