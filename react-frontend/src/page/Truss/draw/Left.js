import { useContext } from "react"
import { penTypeContext, saveImageContext } from './context'

const Left = () => {
    const button = [
        "grab",
        "point",
        "line",
        "constraint2",
        "constraint1",
        "load",
    ]
    const [penType, setPenType] = useContext(penTypeContext)
    const [isSave, setIsSave] = useContext(saveImageContext)
    const buttons = button.map((item, idx) => (
        penType === item ? <li className={`${item} clicked`} key={item} onClick={() => setPenType(item)}>
            <div className="box">
                <div className={item}></div>
            </div>
        </li>
            : <li className={`${item}`} key={item} onClick={() => setPenType(item)}>
                <div className="box">
                    <div className={item}></div>
                </div>
            </li>
    ))
    return (
        <div className="left">
            <ul className="leftButton">
                <li className="logo"></li>
                {buttons}
                <li className="save" onClick={() => setIsSave(true)}>
                    <div className="box">
                        <div className="save"></div>
                    </div>
                </li>
                <li className="clear" onClick={() => setIsSave(true)}>
                    <div className="box">
                        <div className="clear"></div>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Left
