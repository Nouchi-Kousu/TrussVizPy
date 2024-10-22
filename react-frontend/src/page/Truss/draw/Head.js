import { useContext, useEffect, useState } from "react"
import {
    penTypeContext,
    makingsContext,
    lineMakingsIdxContext,
    lineMakingsContext,
} from "./context"
import { Switch } from 'react-kui'
import { Tooltip } from 'react-kui'


const Head = ({
    selectedPointSet,
    delPointSet,
    pointsSet,
    canvasRef,
    selectedLineSet,
    linesSet,
    zoomScaleSet,
    offsetSet,
    loadsSet,
    selectedLoadSet,
    loadZoomSet,
    isTrellisSet,
    trellisStepSet
}) => {
    const [penType] = useContext(penTypeContext)
    const [selectedPoint, setSelectedPoint] = selectedPointSet
    const [points, setPoints] = pointsSet
    const [, setDelPoint] = delPointSet
    const [xValue, setXValue] = useState(0)
    const [yValue, setYValue] = useState(0)
    const [, setMakingsSetting] = useContext(makingsContext)
    const [lineMakings,] = useContext(lineMakingsContext)
    const [lineMakingsIdx, setLineMakingsIdx] = useContext(
        lineMakingsIdxContext
    )
    const [selectedLine, setSelectedLine] = selectedLineSet
    const [lines, setLines] = linesSet
    const [zoomScale, setZoomScale] = zoomScaleSet
    const [offset, setOffset] = offsetSet
    const [loads, setLoads] = loadsSet
    const [selectedLoad, setSelectedLoad] = selectedLoadSet
    const [loadZoom, setLoadZoom] = loadZoomSet
    const [isTrellis, setIsTrellis] = isTrellisSet
    const [trellisStep, setTrellisStep] = trellisStepSet

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
    if (penType === "grab") {
        headTable = <>
            <div className="grab">
                <span>移动：x:</span>
                <input
                    type="number"
                    value={offset.x}
                    onChange={(e) => setOffset({ ...offset, x: Number(e.target.value) })}
                />
                <span>y:</span>
                <input
                    type="number"
                    value={offset.y}
                    onChange={(e) => setOffset({ ...offset, y: Number(e.target.value) })}
                />
                <span>缩放比例:</span>
                <input
                    type="number"
                    value={zoomScale}
                    onChange={(e) => setZoomScale(Number(e.target.value))}
                />
                <span>网格距离:</span>
                <input
                    value={trellisStep.toExponential(0)}
                    disabled
                    className="step"
                />
                <span>开启网格</span>
                <Switch
                    size="small"
                    checked={isTrellis}
                    onChange={(checked) => setIsTrellis(checked)}
                    style={{ boxShadow: '0 0 0', userSelect: 'none', outline: 'none' }}
                />
            </div>
        </>
    } else if (penType === "point") {
        if (selectedPoint !== -1) {
            headTable = (
                <div className="point">
                    <span>x:</span>
                    <input
                        type="number"
                        value={xValue}
                        onChange={(e) => handleInputChange(e, setXValue, "x")}
                    />
                    <span>y:</span>
                    <input
                        type="number"
                        value={yValue}
                        onChange={(e) => handleInputChange(e, setYValue, "y")}
                    />
                    <span className="button"
                        onClick={() => {
                            setDelPoint(selectedPoint)
                        }}
                    >
                        删除
                    </span>
                </div>
            )
        }
    } else if (penType === "line") {
        const makingIdx = selectedLine === -1 ? lineMakingsIdx : lines[selectedLine].makingsIdx
        headTable = (
            <div className="line">
                <span>材料名:</span>
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
                <span>E:</span>
                <span className="list">{lineMakings[makingIdx].E}</span>
                <span>A:</span>
                <span className="list">{lineMakings[makingIdx].A}</span>
                <span>ρ:</span>
                <span className="list">{lineMakings[makingIdx].rho}</span>
                <input
                    type="color"
                    className="color"
                    disabled
                    value={lineMakings[makingIdx].color}
                ></input>
                <span className="button"
                    onClick={() => {
                        setLines(lines.filter((_, idx) => idx !== selectedLine))
                        setSelectedLine(-1)
                    }}>
                    删除
                </span>
            </div >
        )
    } else if (penType === "constraint2") {
        // 不做任何操作
    } else if (penType === "constraint1") {
        if (points[selectedPoint]) {
            headTable = <>
                <span>
                    角度:
                </span>
                <input
                    type="number"
                    className="constraint"
                    value={points[selectedPoint].theta / Math.PI * 180}
                    onChange={(e) => setPoints(points.map((point, idx) => {
                        return idx === selectedPoint ? { ...point, theta: e.target.value / 180 * Math.PI } : point
                    }))}
                ></input>
            </>
        }
    } else if (penType === "load") {
        if (selectedLoad !== -1) {
            headTable = <>
                <span>Fx:</span>
                <input
                    type="number"
                    className="load"
                    value={loads[selectedLoad].Fx}
                    onChange={(e) => setLoads([...loads.map((load, idx) =>
                        idx === selectedLoad ? { ...load, Fx: Number(e.target.value) } : load
                    )])}
                ></input>
                <span>Fy:</span>
                <input
                    type="number"
                    className="load"
                    value={loads[selectedLoad].Fy}
                    onChange={(e) => setLoads([...loads.map((load, idx) =>
                        idx === selectedLoad ? { ...load, Fy: Number(e.target.value) } : load
                    )])}
                ></input>
                <span className="button"
                    onClick={() => {
                        setLoads(loads.filter((_, idx) => idx !== selectedLoad))
                        setSelectedLoad(-1)
                    }}>
                    删除
                </span>
            </>
        } else {
            headTable = <>
                <span>载荷放大系数:</span>
                <input
                    type="number"
                    className="load"
                    value={loadZoom}
                    onChange={(e) => setLoadZoom(Number(e.target.value))}
                ></input>
            </>
        }
    }

    const onLiClick = (penTy) => {
        if (penTy === "line") {
            setMakingsSetting(true)
        } else if (penTy === "grab") {
            setOffset({ x: 50, y: 50 })
            setZoomScale(100)
            setTrellisStep(1)
        } else if (penTy === "point") {
            setSelectedPoint(-1)
        }
    }

    return (
        <div className="head">
            <li
                className={penType}
                onClick={() => onLiClick(penType)}
            ></li>
            <div className="headdiv">
                {headTable}
            </div>
        </div>
    )
}

export default Head
