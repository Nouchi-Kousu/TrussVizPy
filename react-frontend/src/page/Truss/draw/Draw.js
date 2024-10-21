import Right from "./Right"
import Left from "./Left"
import SetLineMakings from "./SetLineMakings"
import {
    penTypeContext,
    makingsContext,
    linesContext,
    lineMakingsIdxContext,
    lineMakingsContext,
    saveImageContext,
    pointsContext,
    loadsContext,
    isClearContext,
    isPushContext,
    isGetPdfContext
} from './context'
import { useState } from "react"
import ReadInp from "./ReadInp"

const Draw = () => {
    const [penType, setPenType] = useState("grab")
    const [makingsSeting, setMakingsSetting] = useState(false)
    const [lineMakings, setLineMakings] = useState([{ name: 'Normal', E: 4.8e6, A: 1, rho: 0, color: '#66ccff' }]) // 储存材料
    const [lineMakingsIdx, setLineMakingsIdx] = useState(0)
    const [lines, setLines] = useState([]) // 储存杆件
    const [isSave, setIsSave] = useState(false)
    const [isReadInp, setIsReadInp] = useState(false)
    const [loads, setLoads] = useState([])
    const [points, setPoints] = useState([]) // 存储结点列表
    const [isClear, setIsClear] = useState(false)
    const [isPush, setIsPush] = useState(false)
    const [isGetPdf, setIsGetPdf] = useState(false)

    return (
        <div className="draw">
            <isGetPdfContext.Provider value={[isGetPdf, setIsGetPdf]}>
            <isPushContext.Provider value={[isPush, setIsPush]}>
            <isClearContext.Provider value={[isClear, setIsClear]}>
            <loadsContext.Provider value={[loads, setLoads]}>
            <pointsContext.Provider value={[points, setPoints]}>
            <lineMakingsContext.Provider value={[lineMakings, setLineMakings]}>
            <lineMakingsIdxContext.Provider value={[lineMakingsIdx, setLineMakingsIdx]}>
            <linesContext.Provider value={[lines, setLines]}>
            <makingsContext.Provider value={[makingsSeting, setMakingsSetting]}>
            <penTypeContext.Provider value={[penType, setPenType]}>
            <saveImageContext.Provider value={[isSave, setIsSave]}>
                <Left isReadInpSet={[isReadInp, setIsReadInp]} />
                <Right isReadInpSet={[isReadInp, setIsReadInp]} />
                {makingsSeting && <SetLineMakings />}
                {isReadInp && <ReadInp isReadInpSet={[isReadInp, setIsReadInp]} />}
            </saveImageContext.Provider>
            </penTypeContext.Provider>
            </makingsContext.Provider>
            </linesContext.Provider>
            </lineMakingsIdxContext.Provider>
            </lineMakingsContext.Provider>
            </pointsContext.Provider>
            </loadsContext.Provider>
            </isClearContext.Provider>
            </isPushContext.Provider>
            </isGetPdfContext.Provider>
        </div>
    )
}

export default Draw
