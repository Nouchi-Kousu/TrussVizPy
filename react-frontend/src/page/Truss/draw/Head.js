import { useContext, useEffect, useState } from "react";
import { penTypeContext, makingsContext } from "./context";

const Head = ({ selectedPointSet, delPointSet, pointsSet, canvasRef }) => {
    const [penType] = useContext(penTypeContext);
    const [selectedPoint] = selectedPointSet;
    const [points, setPoints] = pointsSet;
    const [, setDelPoint] = delPointSet;
    const [xValue, setXValue] = useState(0);
    const [yValue, setYValue] = useState(0);
    const [, setMakingsSetting] = useContext(makingsContext);

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
        // 不做任何操作
    } else if (penType === "constraint2") {
        // 不做任何操作
    } else if (penType === "constraint1") {
        // 不做任何操作
    } else if (penType === "load") {
        // 不做任何操作
    }

    return (
        <div className="head">
            {penType === "line" ? <li className={penType} onClick={() => setMakingsSetting(true)}></li> : <li className={penType}></li>}
            {headTable}
        </div>
    );
};

export default Head;
