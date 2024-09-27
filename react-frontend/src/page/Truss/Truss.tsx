import { useRef, useState } from "react"
import Draw from './draw/Draw'
import Show from './show/Show'
import './CSS/App.scss'

const Truss = () => {
    const penTypeList = ['choose', 'move', 'delete', 'point', 'line', 'constraint2', 'constraint1']
    const drawRef = useRef(null)
    const showRef = useRef(null)
    const [penType, setPenType] = useState(penTypeList[0])
    const [points, setPoints] = useState([])
    const [lines, setLines] = useState([])
    const [constraintNums, setConstraintNums] = useState(0)
    
    return (
        <div className="truss">
            <div className="drawWin"><Draw /></div>
            <div className="showWin"><Show /></div>
        </div>
    )
}

export default Truss