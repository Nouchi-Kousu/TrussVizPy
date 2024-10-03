import { useContext, useEffect, useRef, useState } from "react";
import Head from "./Head";
import { selectedPointContext, pointContext, penTypeContext } from "./context";

const Right = () => {
    const [penType] = useContext(penTypeContext); // 画笔类型
    const canvasRef = useRef(null); // 储存画布的引用
    const [selectedPoint, setSelectedPoint] = useState(-1); // 选中的结点编号
    const [points, setPoints] = useState([]); // 存储结点列表
    const [absoluteMousePosition, setAbsoluteMousePosition] = useState({
        x: 0,
        y: 0,
    }); // 鼠标位置
    const [zoomScale, setZoomScale] = useState(10);
    const [offset, setOffset] = useState({ x: 50, y: 50 }); // 原点平移量
    const [mouseDown, setMouseDown] = useState(-1); // 鼠标摁下
    const [isCtrlPressed, setIsCtrlPressed] = useState(false); // 是否按下ctrl键
    const [isAltPressed, setAltPressed] = useState(false); // 是否按下alt键
    const [isShiftPressed, setIsShiftPressed] = useState(false); // 是否按下shift键
    const [isSpacePressed, setIsSpacePressed] = useState(false); // 是否按下空格键
    const [delPoint, setDelPoint] = useState(-1); // 删除结点编号
    const [lineMakings, setLineMakings] = useState([]); // 储存材料
    const [lineMakingsIdx, setLineMakingIdx] = useState(-1);
    const [lines, setLines] = useState([]); // 储存杆件
    const [selectedLine, setSelectedLine] = useState(-1); // 选中的杆件编号
    const [isDrawLine, setIsDrawLine] = useState(false);

    // 更改canvas大小
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
    };

    // 挂载大小改变
    useEffect(() => {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    // 获取鼠标在坐标系中的位置（像素位置）
    const getMousePosition = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left - offset.x,
            y: canvas.height - (event.clientY - rect.top) - offset.y,
        };
    };

    // 获取鼠标相对左下角的像素坐标
    const getAbsoluteMousePosition = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: canvas.height - (event.clientY - rect.top),
        };
    };

    const getSelectedPoint = (event) => {
        const { x, y } = getMousePosition(event);
        const clickedPointIndex = points.findIndex(
            (circle) =>
                Math.hypot(circle.x * zoomScale - x, circle.y * zoomScale - y) <
                10
        );
        return clickedPointIndex;
    };

    // canvas元素绘制
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // 每次更新坐标系时，重置之前的变换
        context.setTransform(1, 0, 0, 1, 0, 0); // 重置所有变换
        context.translate(offset.x, canvas.height - offset.y); // 平移原点
        context.scale(1, -1); // 翻转 y 轴

        context.clearRect(-offset.x, -offset.y, canvas.width, canvas.height); // 清空整个画布
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
                5,
                0,
                Math.PI * 2,
                true
            );
            context.fillStyle = idx === selectedPoint ? "red" : "blue";
            context.fill();
        });

        lines.forEach((line, idx) => {
            context.beginPath();
            const start = line.points[0];
            const end = line.points[1];
            context.moveTo(
                points[start].x * zoomScale,
                points[start].y * zoomScale
            );
            // TODO 线绘制
            if (typeof end === "number") {
                context.lineTo(
                    points[end].x * zoomScale,
                    points[end].y * zoomScale
                );
            } else {
                context.lineTo(end.x, end.y);
            }
            context.strokeStyle = idx === selectedLine ? "red" : "black";
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        });
    }, [points, selectedPoint, offset, zoomScale, lines, selectedLine]);

    // 删除点
    useEffect(() => {
        if (delPoint !== -1) {
            setPoints(points.filter((_, idx) => idx !== delPoint));
            setDelPoint(-1);
            setSelectedPoint(-1);
            setLines(
                lines
                    .filter(
                        (line) =>
                            !line.points.some((point) => point === delPoint)
                    )
                    .map((line) => {
                        return {
                            ...line,
                            points: line.points.map((point) =>
                                point > delPoint ? point - 1 : point
                            ),
                        };
                    })
            );
        }
    }, [delPoint]);

    // 鼠标摁下
    const handleMouseDown = (event) => {
        event.preventDefault();
        if (event.button === 0) {
            // 左键逻辑
            setMouseDown(0);
            if (isSpacePressed || penType === "grab") {
                const { x, y } = getAbsoluteMousePosition(event);
                setAbsoluteMousePosition({ x, y });
            } else if (penType === "point") {
                const { x, y } = getMousePosition(event);
                const clickedPointIndex = getSelectedPoint(event);
                setSelectedPoint(clickedPointIndex);
                if (clickedPointIndex === -1) {
                    setSelectedPoint(points.length);
                    setPoints([
                        ...points,
                        { x: x / zoomScale, y: y / zoomScale },
                    ]);
                }
            } else if (penType === "delete") {
                // 删除逻辑
                const clickedPointIndex = getSelectedPoint(event);
                setDelPoint(clickedPointIndex);
            } else if (penType === "line") {
                // 画线逻辑
                const clickedPointIndex = getSelectedPoint(event);
                const { x, y } = getMousePosition(event);
                if (
                    clickedPointIndex !== -1 &&
                    isDrawLine &&
                    clickedPointIndex !== selectedPoint
                ) {
                    setLines(
                        lines.map((line, idx) =>
                            idx === selectedLine
                                ? {
                                      ...line,
                                      points: [
                                          line.points[0],
                                          clickedPointIndex,
                                      ],
                                  }
                                : line
                        )
                    );
                    setIsDrawLine(false);
                    setSelectedPoint(-1);
                } else if (
                    clickedPointIndex !== -1 &&
                    clickedPointIndex !== selectedPoint
                ) {
                    setSelectedPoint(clickedPointIndex);
                    setSelectedLine(lines.length);
                    setLines([
                        ...lines,
                        { points: [clickedPointIndex, { x, y }] },
                    ]);
                    setIsDrawLine(true);
                }
            }
        } else if (event.button === 1) {
            // 中键逻辑
            const { x, y } = getAbsoluteMousePosition(event);
            setAbsoluteMousePosition({ x, y });
            setMouseDown(1);
        }
    };

    // 移动坐标系
    const offsetDraw = (event) => {
        const { x, y } = getAbsoluteMousePosition(event);
        setOffset({
            x: offset.x + x - absoluteMousePosition.x,
            y: offset.y + y - absoluteMousePosition.y,
        });
        setAbsoluteMousePosition({ x, y });
    };

    // 鼠标移动
    const handleMouseMove = (event) => {
        if (mouseDown === 0) {
            // 左键逻辑
            if (penType === "grab" || isSpacePressed) {
                offsetDraw(event);
            } else if (penType === "point") {
                const { x, y } = getMousePosition(event);
                setPoints(
                    points.map((point, idx) =>
                        idx === selectedPoint
                            ? { x: x / zoomScale, y: y / zoomScale }
                            : point
                    )
                );
            }
        } else if (mouseDown === 1) {
            // 中键逻辑
            offsetDraw(event);
        }
        if (isDrawLine) {
            const { x, y } = getMousePosition(event);
            setLines(
                lines.map((line, idx) =>
                    idx === selectedLine
                        ? {
                              ...line,
                              points: [line.points[0], { x: x, y: y }],
                          }
                        : line
                )
            );
        }
    };

    // 鼠标抬起
    const handleMouseUp = () => {
        setMouseDown(-1);
    };

    // 滚轮逻辑
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

    // 键盘事件
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Control") {
                setIsCtrlPressed(true);
            } else if (event.key === "Alt") {
                setAltPressed(true);
            } else if (event.key === "Shift") {
                setIsShiftPressed(true);
            } else if (event.key === " ") {
                setIsSpacePressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === "Control") {
                setIsCtrlPressed(false);
            } else if (event.key === "Alt") {
                setAltPressed(false);
            } else if (event.key === "Shift") {
                setIsShiftPressed(false);
            } else if (event.key === " ") {
                setIsSpacePressed(false);
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
                delPointSet={[delPoint, setDelPoint]}
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
