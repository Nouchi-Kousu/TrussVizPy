import { useState } from "react";
import Head from "./Head";
import { selectedPointContext } from "./context";

const Right = () => {
    const [selectedPoint, setSelectedPoint] = useState(null); // 存储选中的圆

    return (
        <div className="right">
            <selectedPointContext.Provider
                value={[selectedPoint, setSelectedPoint]}>
                <Head />
                <canvas className="canvas"></canvas>
            </selectedPointContext.Provider>
        </div>
    );
};

export default Right;
