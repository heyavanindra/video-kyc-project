import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Verified from './pages/Verified'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/verified' element={<Verified />} />
    </Routes>
  )
}

export default App