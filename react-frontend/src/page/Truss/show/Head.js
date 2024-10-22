import { useEffect, useState } from "react"
import { Switch, Input } from 'react-kui'

const Head = ({ zoomScaleSet, offsetSet, saved, penTypeSet, selected, dispScaleSet, loadZoomSet, isAbsSet }) => {
    const [zoomScale, setZoomScale] = zoomScaleSet
    const [offset, setOffset] = offsetSet
    const [dispScale, setDispScale] = dispScaleSet
    const [loadZoom, setLoadZoom] = loadZoomSet
    const [isAbs, setIsAbs] = isAbsSet
    const setIsSave = saved
    const [penType, setPenType] = penTypeSet
    const penTypes = [
        "grab",
        "choose",
        "save"
    ]
    let headlist = <></>
    if (penType === "choose") {
        if (selected.type === "point") {
            headlist = (
                <div className="headdiv">
                    <span>dx:</span>
                    <input
                        type="number"
                        value={selected.dx.toExponential(2)}
                        disabled
                    />
                    <span>dy:</span>
                    <input
                        type="number"
                        value={selected.dy.toExponential(2)}
                        disabled
                    />
                </div>
            )
        } else if (selected.type === "line") {
            headlist = (
                <div className="headdiv">
                    <span>Sigma:</span>
                    <input
                        type="number"
                        value={selected.sigma.toExponential(2)}
                        disabled
                    />
                </div>
            )
        }
    } else if (penType === "save") {
        headlist = <div className="headdiv">
            <li className="save"></li>
        </div>
    } else if (penType === "grab") {
        headlist = <div className="headdiv">
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
        </div>
    } else if (penType === "set") {
        headlist = (
            <div className="headdiv">
                <span>位移乘数（x100）:</span>
                <input
                    type="number"
                    className="set"
                    value={dispScale / 100}
                    onChange={(e) => setDispScale(Number(e.target.value) * 100)}
                />
                <span>载荷乘数:</span>
                <input
                    type="number"
                    className="set"
                    value={loadZoom}
                    onChange={(e) => setLoadZoom(Number(e.target.value))}
                />
                <span>应力绝对值:</span>
                <Switch
                    size="small"
                    checked={isAbs}
                    onChange={(checked) => setIsAbs(checked)}
                />
            </div>
        )
    }


    return <>
        <div className="head">
            <li className={penType === "grab" ? "grab chicked" : "grab"} onClick={() => penType === "grab" ? setPenType(null) : setPenType("grab")}
                onDoubleClick={() => {
                    setZoomScale(100)
                    setOffset({ x: 50, y: 50 })
                }}
            ></li>
            {penType === "grab" && headlist}
            <li className={penType === "choose" ? "choose chicked" : "choose"} onClick={() => penType === "choose" ? setPenType(null) : setPenType("choose")}></li>
            {penType === "choose" && headlist}
            <li className={penType === "set" ? "set chicked" : "set"} onClick={() => penType === "set" ? setPenType(null) : setPenType("set")}
                onDoubleClick={() => {
                    setDispScale(1000)
                    setLoadZoom(100)
                }}
            ></li>
            {penType === "set" && headlist}
            <li className="save" onClick={() => setIsSave(true)}></li>
        </div>
    </>
}

export default Head