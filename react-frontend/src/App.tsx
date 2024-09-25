import { useRef, useState } from "react"

const App = () => {
    const penTypeList = ['choose', 'move', 'delete', 'point', 'line', 'constraint2', 'constraint1']
    const drawRef = useRef(null)
    const showRef = useRef(null)
    const [penType, setPenType] = useState(penTypeList[0])
    const [points, setPoints] = useState([])
    const [lines, setLines] = useState([])
    const [constraintNums, setConstraintNums] = useState(0)
    
    return (
        <div>123</div>
    )
}

export default App