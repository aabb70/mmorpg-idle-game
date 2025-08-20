import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import LoginPage from './pages/LoginPage'
import GamePage from './pages/GamePage'
import AdminPage from './pages/AdminPage'
import IconTestPage from './components/IconTestPage'

function App() {
  return (
    <Container maxWidth="xl">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/icon-test" element={<IconTestPage />} />
      </Routes>
    </Container>
  )
}

export default App