import { useContext } from "react"
import { penTypeContext, saveImageContext, isClearContext, isPushContext } from './context'

const Left = ({ isReadInpSet }) => {
    const button = [
        "grab",
        "point",
        "line",
        "constraint2",
        "constraint1",
        "load",
    ]
    const [isReadInp, setIsReadInp] = isReadInpSet
    const [penType, setPenType] = useContext(penTypeContext)
    const [, setIsSave] = useContext(saveImageContext)
    const [, setIsClear] = useContext(isClearContext)
    const [, setIsPush] = useContext(isPushContext)
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
                <li className="logo" onClick={() => setIsReadInp(true)}></li>
                {buttons}
                <li className="save" onClick={() => setIsSave(true)}>
                    <div className="box">
                        <div className="save"></div>
                    </div>
                </li>
                <li className="clear" onClick={() => setIsClear(window.confirm("确定清除画布？"))}>
                    <div className="box">
                        <div className="clear"></div>
                    </div>
                </li>
                <li className="push" onClick={() => setIsPush(true)}>
                    <div className="box">
                        <div className="push"></div>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Left
