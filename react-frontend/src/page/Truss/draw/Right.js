import { useContext, useEffect, useRef, useState } from "react";
import Head from "./Head";
import { selectedPointContext, pointContext, penTypeContext } from "./context";

const Right = () => {
    const [penType] = useContext(penTypeContext);
    const canvasRef = useRef(null); // 储存画布的引用
    const [selectedPoint, setSelectedPoint] = useState(-1); // 存储选中的结点
    const [points, setPoints] = useState([]); // 存储结点列表
    const [absoluteMousePosition, setAbsoluteMousePosition] = useState({
        x: 0,
        y: 0,
    }); // 鼠标位置
    const [isdragging, setIsDragging] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);
    const [offset, setOffset] = useState({ x: 50, y: 50 }); // 原点平移量
    const [isGrab, setIsGrab] = useState(false);

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

    // 动态应用坐标变换
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // 每次更新坐标系时，重置之前的变换
        context.setTransform(1, 0, 0, 1, 0, 0); // 重置所有变换
        context.translate(offset.x, canvas.height - offset.y); // 平移原点
        context.scale(1, -1); // 翻转 y 轴

        // 绘制坐标轴（仅用于测试）
        context.clearRect(
            -canvas.width,
            -canvas.height,
            canvas.width * 2,
            canvas.height * 2
        ); // 清空整个画布
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(100, 0); // x 轴
        context.moveTo(0, 0);
        context.lineTo(0, 100); // y 轴
        context.stroke();

        // 绘制点
        points.forEach((point, idx) => {
            context.beginPath();
            context.arc(point.x, point.y, 10, 0, Math.PI * 2, true);
            context.fillStyle = idx === selectedPoint ? "red" : "blue";
            context.fill();
        });
    }, [points, selectedPoint, offset, zoomScale]); // 当原点或缩放发生变化时，重新绘制

    const getMousePosition = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left - offset.x,
            y: canvas.height - (event.clientY - rect.top) - offset.y,
        };
    };

    const getAbsoluteMousePosition = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: canvas.height - (event.clientY - rect.top),
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
        if (penType === "grab") {
            setIsGrab(true);
            const { x, y } = getAbsoluteMousePosition(event);
            setAbsoluteMousePosition({ x, y });
        }
    };

    const handleMouseMove = (event) => {
        // if (isdragging) {
        //     const { x, y } = getMousePosition(event);
        //     setMousePosition({ x, y });
        // }
        if (isGrab) {
            const { x, y } = getAbsoluteMousePosition(event);
            setOffset({
                x: offset.x + x - absoluteMousePosition.x,
                y: offset.y + y - absoluteMousePosition.y,
            });
            setAbsoluteMousePosition({ x, y });
            console.log(offset);
        }
    };

    const handleMouseUp = () => {
        setIsGrab(false);
    };

    return (
        <div className="right">
            <Head
                selectedPointSet={[selectedPoint, setSelectedPoint]}
                pointsSet={[points, setPoints]}
                canvasRef={canvasRef}
            />
            <canvas
                ref={canvasRef}
                className="canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            ></canvas>
        </div>
    );
};

export default Right;
