import { useContext, useEffect, useState } from "react";
import {
    penTypeContext,
    makingsContext,
    lineMakingsIdxContext,
    lineMakingsContext,
} from "./context";

const Head = ({
    selectedPointSet,
    delPointSet,
    pointsSet,
    canvasRef,
    selectedLineSet,
    linesSet
}) => {
    const [penType] = useContext(penTypeContext);
    const [selectedPoint] = selectedPointSet;
    const [points, setPoints] = pointsSet;
    const [, setDelPoint] = delPointSet;
    const [xValue, setXValue] = useState(0);
    const [yValue, setYValue] = useState(0);
    const [, setMakingsSetting] = useContext(makingsContext);
    const [lineMakings, setLineMakings] = useContext(lineMakingsContext);
    const [lineMakingsIdx, setLineMakingsIdx] = useContext(
        lineMakingsIdxContext
    );
    const [selectedLine, setSelectedLine] = selectedLineSet;
    const [lines, setLines] = linesSet;

    useEffect(() => {
        if (selectedPoint !== -1) {
            const point = points[selectedPoint];
            setXValue(point.x);
            setYValue(point.y);
        }
    }, [selectedPoint, points]);

    const handleInputChange = (e, setter, index) => {
        const value = e.target.value;
        setter(value);
        if (selectedPoint !== -1) {
            const newPoints = [...points];
            newPoints[selectedPoint][index] = Number(value);
            setPoints(newPoints);
        }
    };

    let headTable = <></>;
    if (penType === "choose") {
        if (selectedPoint) {
            headTable = <>111</>;
        }
    } else if (penType === "grab") {
        headTable = <></>;
    } else if (penType === "delete") {
        // 不做任何操作
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
                            setDelPoint(selectedPoint);
                        }}
                    >
                        删除
                    </button>
                </div>
            );
        }
    } else if (penType === "line") {
        const makingIdx = selectedLine === -1 ? lineMakingsIdx : lines[selectedLine].makingsIdx;
        headTable = (
            <div className="line">
                材料名：
                <select
                    onChange={(e) => {
                        setLineMakingsIdx(e.target.value);
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
                            selected={index === makingIdx}
                        >
                            {making.name}
                        </option>
                    ))}
                </select>
                &nbsp; E：
                <span className="list">{lineMakings[makingIdx].E}</span>&nbsp;
                A：<span className="list">{lineMakings[makingIdx].A}</span>
                &nbsp; ρ：
                <span className="list">{lineMakings[makingIdx].rho}</span>
                &nbsp;&nbsp;
                <input
                    type="color"
                    className="color"
                    disabled
                    value={lineMakings[makingIdx].color}
                ></input>
            </div>
        );
    } else if (penType === "constraint2") {
        // 不做任何操作
    } else if (penType === "constraint1") {
        // 不做任何操作
    } else if (penType === "load") {
        // 不做任何操作
    }

    return (
        <div className="head">
            {penType === "line" ? (
                <li
                    className={penType}
                    onClick={() => setMakingsSetting(true)}
                ></li>
            ) : (
                <li className={penType}></li>
            )}
            {headTable}
        </div>
    );
};

export default Head;
