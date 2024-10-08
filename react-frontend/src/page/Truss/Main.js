import { useRef, useState } from "react"
import Draw from "./draw/Draw"
import Show from "./show/Show"
import Truss from "./Truss"
import "./CSS/App.scss"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

const TrussMain = () => {
    const penTypeList = [
        "choose",
        "move",
        "delete",
        "point",
        "line",
        "constraint2",
        "constraint1",
    ]
    const drawRef = useRef(null)
    const showRef = useRef(null)
    const [penType, setPenType] = useState(penTypeList[0])
    const [points, setPoints] = useState([])
    const [lines, setLines] = useState([])
    const [constraintNums, setConstraintNums] = useState(0)
    const [drawData, setDrawData] = useState({ isLoad: false, lines: [], points: [] })

    return (
            <Routes>
                <Route path="/" element={<Truss />} />
                <Route path="draw" element={
                    <div className="only"><Draw /></div>
                } />
                <Route path="show" element={
                    <div className="only"><Show /></div>
                } />
            </Routes>
    )
}

export default TrussMain
