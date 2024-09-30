import { useContext, useEffect, useRef, useState } from "react";
import Head from "./Head";
import { selectedPointContext, pointContext, penTypeContext } from "./context";

const Right = () => {
    const [penType] = useContext(penTypeContext);
    const canvasRef = useRef(null); // 储存画布的引用
    const [selectedPoint, setSelectedPoint] = useState(-1); // 存储选中的结点
    const [points, setPoints] = useState([]); // 存储结点列表
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // 鼠标位置
    const [isdragging, setIsDragging] = useState(false);

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
    };

    useEffect(() => {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制已有的圆
        points.forEach((point, idx) => {
            console.log("render");
            context.beginPath();
            context.arc(point.x, point.y, 10, 0, Math.PI * 2, true);
            if (idx === selectedPoint) {
                context.fillStyle = "red";
            } else {
                context.fillStyle = "blue";
            }
            context.fill();
            context.closePath();
        });
    }, [points, selectedPoint, mousePosition]);

    const getMousePosition = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    };

    const handleMouseDown = (event) => {
        const { x, y } = getMousePosition(event);
        const clickedPointIndex = points.findIndex(
            (circle) => Math.hypot(circle.x - x, circle.y - y) < 10
        );
        setSelectedPoint(clickedPointIndex);
        if (penType === "point") {
            if (clickedPointIndex === -1) {
                setSelectedPoint(points.length);
                setPoints([...points, { x: x, y: y }]);
            }
        }
    };

    return (
        <div className="right">
                    <Head
                        selectedPointSet={selectedPoint}
                        pointsSet={points}
                    />
                    <canvas
                        ref={canvasRef}
                        className="canvas"
                        onMouseDown={handleMouseDown}
                    ></canvas>
        </div>
    );
};

export default Right;
