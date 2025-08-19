import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import LoginPage from './pages/LoginPage'
import GamePage from './pages/GamePage'

function App() {
  return (
    <Container maxWidth="xl">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </Container>
  )
}

export default App