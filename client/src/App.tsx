import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { useState } from 'react'


import Form from './routes/Form'
import Board from './routes/Board'

import { Toaster } from 'react-hot-toast'

function App() {
  const [uname, setUname] = useState("")

  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Form uname={uname} setUname={setUname}/>} />
          <Route path="/game" element={<Board/>} />
          <Route path="*" element={<Navigate to="/" replace={true}/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
