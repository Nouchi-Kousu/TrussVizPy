import { useContext } from "react"
import {penTypeConText, selectedPointContext} from "./context"

const Head = () => {
    const [penType] = useContext(penTypeConText)
    const [selectedPoint] = useContext(selectedPointContext)
    let headTable = <></>
    switch (penType) {
        case "choose":
            if (selectedPoint) {
                headTable = <>
                    111
                </>
            }
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
            {headTable}
        </div>
    )
}

export default Head