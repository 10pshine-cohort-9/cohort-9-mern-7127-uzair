import { BrowserRouter,Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useState } from 'react'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/' element={<Navigate to='/login' replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
