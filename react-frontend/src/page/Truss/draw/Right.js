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
    const [isDragging, setIsDragging] = useState(false);
    const [zoomScale, setZoomScale] = useState(10);
    const [offset, setOffset] = useState({ x: 50, y: 50 }); // 原点平移量
    const [mouseDown, setMouseDown] = useState(-1);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [isAltPressed, setAltPressed] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

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

        context.clearRect(
            -canvas.width,
            -canvas.height,
            canvas.width * 2,
            canvas.height * 2
        ); // 清空整个画布
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(60, 0); // x 轴
        context.moveTo(0, 0);
        context.lineTo(0, 60); // y 轴
        context.stroke();

        // 绘制点
        points.forEach((point, idx) => {
            context.beginPath();
            context.arc(
                point.x * zoomScale,
                point.y * zoomScale,
                10,
                0,
                Math.PI * 2,
                true
            );
            context.fillStyle = idx === selectedPoint ? "red" : "blue";
            context.fill();
        });
    }, [points, selectedPoint, offset, zoomScale]);

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
        event.preventDefault();
        if (event.button === 0) {
            setMouseDown(0);
            if (penType === "point") {
                const { x, y } = getMousePosition(event);
                const clickedPointIndex = points.findIndex(
                    (circle) => Math.hypot(circle.x - x, circle.y - y) < 10
                );
                setSelectedPoint(clickedPointIndex);
                if (clickedPointIndex === -1) {
                    setSelectedPoint(points.length);
                    setPoints([
                        ...points,
                        { x: x / zoomScale, y: y / zoomScale },
                    ]);
                }
            }
            if (penType === "grab") {
                const { x, y } = getAbsoluteMousePosition(event);
                setAbsoluteMousePosition({ x, y });
            }
        } else if (event.button === 1) {
            const { x, y } = getAbsoluteMousePosition(event);
            setAbsoluteMousePosition({ x, y });
            setMouseDown(2);
        }
    };

    const handleMouseMove = (event) => {
        if (mouseDown === 0) {
            if (penType === "point") {
                const { x, y } = getMousePosition(event);
                setPoints(
                    points.map((point, idx) =>
                        idx === selectedPoint
                            ? { x: x / zoomScale, y: y / zoomScale }
                            : point
                    )
                );
            }
            if (penType === "grab") {
                const { x, y } = getAbsoluteMousePosition(event);
                setOffset({
                    x: offset.x + x - absoluteMousePosition.x,
                    y: offset.y + y - absoluteMousePosition.y,
                });
                setAbsoluteMousePosition({ x, y });
            }
        } else if (mouseDown === 2) {
            const { x, y } = getAbsoluteMousePosition(event);
            setOffset({
                x: offset.x + x - absoluteMousePosition.x,
                y: offset.y + y - absoluteMousePosition.y,
            });
            setAbsoluteMousePosition({ x, y });
        }
    };

    const handleMouseUp = () => {
        setMouseDown(-1);
    };

    useEffect(() => {
        const canvas = canvasRef.current;

        const handleWheel = (event) => {
            event.preventDefault();
            const delta = event.deltaY;
            if (isAltPressed && isCtrlPressed) {
                const alpha = isShiftPressed ? 0.3 : 0.1;
                const zoomFactor = delta > 0 ? 1 - alpha : 1 + alpha;
                setZoomScale(zoomScale * zoomFactor);
                const { x, y } = getMousePosition(event);
                setOffset({
                    x: offset.x + (1 - zoomFactor) * x,
                    y: offset.y + (1 - zoomFactor) * y,
                });
            } else if (isCtrlPressed) {
                const offsetNum = isShiftPressed ? 100 : 10;
                const offsetStep = delta > 0 ? -offsetNum : offsetNum;
                setOffset({
                    x: offset.x + offsetStep,
                    y: offset.y,
                });
            } else {
                const offsetNum = isShiftPressed ? 100 : 10;
                const offsetStep = delta > 0 ? -offsetNum : offsetNum;
                setOffset({
                    x: offset.x,
                    y: offset.y + offsetStep,
                });
            }
        };

        // 手动添加 wheel 事件监听器，设置 passive 为 false
        canvas.addEventListener("wheel", handleWheel, { passive: false });

        // 组件卸载时移除事件监听器
        return () => {
            canvas.removeEventListener("wheel", handleWheel);
        };
    }, [isCtrlPressed, isAltPressed, zoomScale, offset]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Control") {
                setIsCtrlPressed(true);
            } else if (event.key === "Alt") {
                setAltPressed(true);
            } else if (event.key === "Shift") {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === "Control") {
                setIsCtrlPressed(false);
            } else if (event.key === "Alt") {
                setAltPressed(false);
            } else if (event.key === "Shift") {
                setIsShiftPressed(false);
            }
        };

        // 绑定键盘按下和抬起事件
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

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
