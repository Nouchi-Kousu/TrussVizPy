import { useRef, useState } from "react"
import TrussMain from './page/Truss/Main'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'react-kui/dist/k-ui.css'

const App = () => {

    return (
        <Router>
            <Routes>
                <Route path="/truss/*" element={<TrussMain />} />
            </Routes>
        </Router>
    )
}

export default App