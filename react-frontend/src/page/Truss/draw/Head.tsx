import { useContext } from "react"
import {penTypeConText} from "./context"

const Head = () => {
    const [penType] = useContext(penTypeConText)
    let headTable
    switch (penType) {
        case "choose":
            break
        case "move":
            break
        case "grab":
            headTable = <>
                
            </>
            break
    }
    
    return (
        <div className="head">
            <li className={penType}></li>
        </div>
    )
}

export default Head