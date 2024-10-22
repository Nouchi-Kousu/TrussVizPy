import { useContext } from "react"
import {
    penTypeContext,
    saveImageContext,
    isClearContext,
    isPushContext,
    isGetPdfContext
} from './context'
import { Tooltip } from 'react-kui'


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
        penType === item ?
            <Tooltip title={title[idx]} placement="right">
                <li className={`${item} clicked`} key={item} onClick={() => setPenType(item)}>
                    <div className="box">
                        <div className={item}></div>
                    </div>
                </li>
            </Tooltip>
            :
            <Tooltip title={title[idx]} placement="right">
                <li className={`${item}`} key={item} onClick={() => setPenType(item)} title={title[idx]}>
                    <div className="box">
                        <div className={item}></div>
                    </div>
                </li>
            </Tooltip>
    ))
    return (
        <div className="left">
            <ul className="leftButton">
                <li className="logo" onClick={() => setIsReadInp(true)}></li>
                {buttons}
                <Tooltip title="保存为图片" placement="right">
                    <li className="save" onClick={() => setIsSave(true)}>
                        <div className="box">
                            <div className="save"></div>
                        </div>
                    </li>
                </Tooltip>
                <Tooltip title="清除画布" placement="right">
                    <li className="clear" onClick={() => setIsClear(window.confirm("确定清除画布？"))}>
                        <div className="box">
                            <div className="clear"></div>
                        </div>
                    </li>
                </Tooltip>
                <Tooltip title="强制提交计算" placement="right">
                    <li className="push" onClick={() => setIsPush(true)}>
                        <div className="box">
                            <div className="push"></div>
                        </div>
                    </li>
                </Tooltip>
                <Tooltip title="下载报告文件" placement="right">
                    <li className="pdf" onClick={() => setIsGetPdf(true)}>
                        <div className="box">
                            <div className="pdf"></div>
                        </div>
                    </li>
                </Tooltip>
            </ul>
        </div>
    )
}

export default Left
