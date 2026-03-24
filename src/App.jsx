import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DitButtons from './pages/DitButtons'
import MuiButtons from './pages/MuiButtons'
import ArkUI from './pages/ArkUI'
import Storage from './pages/Storage'
import Members from './pages/Members'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DitButtons />} />
        <Route path="/mui" element={<MuiButtons />} />
        <Route path="/ark" element={<ArkUI />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/members" element={<Members />} />
      </Routes>
    </BrowserRouter>
  )
}
