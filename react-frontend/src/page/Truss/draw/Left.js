import { useContext } from "react"
import {
    penTypeContext,
    saveImageContext,
    isClearContext,
    isPushContext,
    isGetPdfContext
} from './context'

const Left = ({ isReadInpSet }) => {
    const button = [
        "grab",
        "point",
        "line",
        "constraint2",
        "constraint1",
        "load",
    ]
    const title = [
        "移动",
        "结点",
        "杆件",
        "固定铰支座",
        "可动铰支座",
        "载荷",
    ]
    const [, setIsReadInp] = isReadInpSet
    const [penType, setPenType] = useContext(penTypeContext)
    const [, setIsSave] = useContext(saveImageContext)
    const [, setIsClear] = useContext(isClearContext)
    const [, setIsPush] = useContext(isPushContext)
    const [, setIsGetPdf] = useContext(isGetPdfContext)

    const buttons = button.map((item, idx) => (
        penType === item ? <li className={`${item} clicked`} key={item} onClick={() => setPenType(item)} title={title[idx]}>
            <div className="box">
                <div className={item}></div>
            </div>
        </li>
            : <li className={`${item}`} key={item} onClick={() => setPenType(item)} title={title[idx]}>
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
                <li className="save" onClick={() => setIsSave(true)} title="保存为图片">
                    <div className="box">
                        <div className="save"></div>
                    </div>
                </li>
                <li className="clear" onClick={() => setIsClear(window.confirm("确定清除画布？"))} title="清除画布">
                    <div className="box">
                        <div className="clear"></div>
                    </div>
                </li>
                <li className="push" onClick={() => setIsPush(true)} title="强制提交计算">
                    <div className="box">
                        <div className="push"></div>
                    </div>
                </li>
                <li className="pdf" onClick={() => setIsGetPdf(true)} title="下载报告文件">
                    <div className="box">
                        <div className="pdf"></div>
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default Left
