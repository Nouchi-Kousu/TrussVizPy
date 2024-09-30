import { useContext } from "react";
import { penTypeContext, selectedPointContext } from "./context";

const Head = ({ selectedPointSet, pointsSet, canvasRef }) => {
    const [penType] = useContext(penTypeContext);
    const [selectedPoint] = selectedPointSet;
    const [points] = pointsSet;
    const canvas = canvasRef.current;
    // let canvasWidth = canvas.width;
    // const canvasHeight = canvas.height;
    let headTable = <></>;
    if (penType === "choose") {
        if (selectedPoint) {
            headTable = <>111</>;
        }
    } else if (penType === "move") {
        // 不做任何操作
    } else if (penType === "grab") {
        headTable = <></>;
    } else if (penType === "delete") {
        // 不做任何操作
    } else if (penType === "point") {
        console.log(selectedPoint);
        if (selectedPoint !== -1) {
            const point = points[selectedPoint];
            headTable = (
                <>
                    {point.x},{point.y}
                </>
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
            <li className={penType}></li>
            {headTable}
        </div>
    );
};

export default Head;
