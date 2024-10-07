import { useContext, useEffect, useState } from "react"
import {
    penTypeContext,
    makingsContext,
    lineMakingsIdxContext,
    lineMakingsContext,
} from "./context"

const Head = ({
    selectedPointSet,
    delPointSet,
    pointsSet,
    canvasRef,
    selectedLineSet,
    linesSet,
    zoomScaleSet,
    offsetSet
}) => {
    const [penType] = useContext(penTypeContext)
    const [selectedPoint] = selectedPointSet
    const [points, setPoints] = pointsSet
    const [, setDelPoint] = delPointSet
    const [xValue, setXValue] = useState(0)
    const [yValue, setYValue] = useState(0)
    const [, setMakingsSetting] = useContext(makingsContext)
    const [lineMakings, setLineMakings] = useContext(lineMakingsContext)
    const [lineMakingsIdx, setLineMakingsIdx] = useContext(
        lineMakingsIdxContext
    )
    const [selectedLine, setSelectedLine] = selectedLineSet
    const [lines, setLines] = linesSet
    const [zoomScale, setZoomScale] = zoomScaleSet
    const [offset, setOffset] = offsetSet

    useEffect(() => {
        if (selectedPoint !== -1) {
            const point = points[selectedPoint]
            setXValue(point.x)
            setYValue(point.y)
        }
    }, [selectedPoint, points])

    const handleInputChange = (e, setter, index) => {
        const value = e.target.value
        setter(value)
        if (selectedPoint !== -1) {
            const newPoints = [...points]
            newPoints[selectedPoint][index] = Number(value)
            setPoints(newPoints)
        }
    }

    let headTable = <></>
    if (penType === "choose") {
        if (selectedPoint) {
            headTable = <>111</>
        }
    } else if (penType === "grab") {
        headTable = <>
            <div className="grab">
                移动：x
                <input
                    type="number"
                    value={offset.x}
                    onChange={(e) => setOffset({ ...offset, x: Number(e.target.value) })}
                />
                y
                <input
                    type="number"
                    value={offset.y}
                    onChange={(e) => setOffset({ ...offset, y: Number(e.target.value) })}
                />
                缩放比例：
                <input
                    type="number"
                    value={zoomScale}
                    onChange={(e) => setZoomScale(Number(e.target.value))}
                />
            </div>
        </>
    } else if (penType === "point") {
        if (selectedPoint !== -1) {
            headTable = (
                <div className="point">
                    <input
                        type="number"
                        value={xValue}
                        onChange={(e) => handleInputChange(e, setXValue, "x")}
                    />
                    <input
                        type="number"
                        value={yValue}
                        onChange={(e) => handleInputChange(e, setYValue, "y")}
                    />
                    <button
                        onClick={() => {
                            setDelPoint(selectedPoint)
                        }}
                    >
                        删除
                    </button>
                </div>
            )
        }
    } else if (penType === "line") {
        const makingIdx = selectedLine === -1 ? lineMakingsIdx : lines[selectedLine].makingsIdx
        headTable = (
            <div className="line">
                材料名：
                <select
                    value={makingIdx}
                    onChange={(e) => {
                        setLineMakingsIdx(e.target.value)
                        setLines([...lines.map((line, idx) => {
                            return idx === selectedLine ? { ...line, makingsIdx: e.target.value } : line
                        })])
                        console.log(lines)
                    }}
                >
                    {lineMakings.map((making, index) => (
                        <option
                            key={index}
                            value={index}
                        >
                            {making.name}
                        </option>
                    ))}
                </select>
                &nbsp E：
                <span className="list">{lineMakings[makingIdx].E}</span>&nbsp
                A：<span className="list">{lineMakings[makingIdx].A}</span>
                &nbsp ρ：
                <span className="list">{lineMakings[makingIdx].rho}</span>
                &nbsp&nbsp
                <input
                    type="color"
                    className="color"
                    disabled
                    value={lineMakings[makingIdx].color}
                ></input>
            </div>
        )
    } else if (penType === "constraint2") {
        // 不做任何操作
    } else if (penType === "constraint1") {
        headTable = <>
            角度：
            <input
                type="number"
                className="constraint"
                value={points[selectedPoint].alpha / Math.PI * 180}
                onChange={(e) => setPoints(points.map((point, idx) => {
                    return idx === selectedPoint ? { ...point, alpha: e.target.value / 180 * Math.PI } : point
                }))}
            ></input>
        </>
    } else if (penType === "load") {
        // 不做任何操作
    }

    const onLiClick = (penTy) => {
        if (penTy === "line") {
            setMakingsSetting(true)
        } else if (penTy === "grab") {
            setOffset({ x: 50, y: 50 })
            setZoomScale(10)
        }
    }

    return (
        <div className="head">
            <li
                className={penType}
                onClick={() => onLiClick(penType)}
            ></li>
            {headTable}
        </div>
    )
}

export default Head
