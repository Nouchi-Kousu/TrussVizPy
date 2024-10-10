import { useContext, useEffect, useRef, useState } from "react"
import Head from "./Head"

const Draw = () => {
    const canvasRef = useRef(null) // 储存画布的引用
    const [zoomScale, setZoomScale] = useState(10)
    const [offset, setOffset] = useState({ x: 50, y: 50 }) // 原点平移量
    const [test, setTast] = useState(null)
    const [drawData, setDrawData] = useState({
        isLoad: false,
        lines: [],
        points: [],
    })
    const [resize, setResize] = useState(false)
    const [mouseDown, setMouseDown] = useState(-1) // 鼠标摁下
    const [isCtrlPressed, setIsCtrlPressed] = useState(false) // 是否按下ctrl键
    const [isAltPressed, setAltPressed] = useState(false) // 是否按下alt键
    const [isShiftPressed, setIsShiftPressed] = useState(false) // 是否按下shift键
    const [isSpacePressed, setIsSpacePressed] = useState(false) // 是否按下空格键
    const [absoluteMousePosition, setAbsoluteMousePosition] = useState({
        x: 0,
        y: 0,
    }) // 鼠标位置

    // 更改canvas大小
    const resizeCanvas = () => {
        setResize(n => !n)
        const canvas = canvasRef.current
        if (canvas) {
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
        }
    }

    useEffect(() => {
        const channel = new BroadcastChannel("truss")
        const headleMessage = (event) => {
            console.log(event)
            const data = event.data
            if (data.points) {
                setDrawData(data)
            }
        }
        channel.onmessage = headleMessage
        return () => {
            channel.close()
        }
    }, [])

    // 挂载大小改变
    useEffect(() => {
        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)
        return () => {
            window.removeEventListener("resize", resizeCanvas)
        }
    }, [])

    // 获取鼠标在坐标系中的位置（像素位置）
    const getMousePosition = (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        return {
            x: event.clientX - rect.left - offset.x,
            y: canvas.height - (event.clientY - rect.top) - offset.y,
        }
    }

    // 获取鼠标相对左下角的像素坐标
    const getAbsoluteMousePosition = (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        return {
            x: event.clientX - rect.left,
            y: canvas.height - (event.clientY - rect.top),
        }
    }

    // canvas元素绘制
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        // 每次更新坐标系时，重置之前的变换
        context.setTransform(1, 0, 0, 1, 0, 0) // 重置所有变换
        context.translate(offset.x, canvas.height - offset.y) // 平移原点
        context.scale(1, -1) // 翻转 y 轴

        context.clearRect(-offset.x, -offset.y, canvas.width, canvas.height) // 清空整个画布
        context.beginPath()
        context.strokeStyle = "#000000"
        context.lineWidth = 2
        context.moveTo(0, 0)
        context.lineTo(60, 0) // x 轴
        context.moveTo(0, 0)
        context.lineTo(0, 60) // y 轴
        context.stroke()

        if (!drawData.isLoad) {
            drawData.lines.forEach((line, idx) => {
                context.beginPath()
                const start = line.points[0]
                const end = line.points[1]
                context.moveTo(
                    drawData.points[start].x * zoomScale,
                    drawData.points[start].y * zoomScale
                )
                if (typeof end === "number") {
                    context.lineTo(
                        drawData.points[end].x * zoomScale,
                        drawData.points[end].y * zoomScale
                    )
                } else {
                    context.lineTo(end.x, end.y)
                }
                context.strokeStyle = "#39c5bb"
                context.lineWidth = 2
                context.stroke()
                context.closePath()
                context.shadowColor = "transparent" // 关闭阴影
                context.shadowBlur = 0
                context.shadowOffsetX = 0
                context.shadowOffsetY = 0
            })
        }

        // 绘制点
        drawData.points.forEach((point, idx) => {
            context.beginPath()
            context.arc(
                point.x * zoomScale,
                point.y * zoomScale,
                4,
                0,
                Math.PI * 2,
                true
            )
            context.fillStyle = "blue"
            context.fill()
            if (point.constraint === 2) {
                context.beginPath()
                context.moveTo(point.x * zoomScale, point.y * zoomScale)
                context.lineTo(point.x * zoomScale - 12, point.y * zoomScale)
                context.lineTo(point.x * zoomScale, point.y * zoomScale - 12)
                context.lineTo(point.x * zoomScale, point.y * zoomScale)
                context.strokeStyle = "black"
                context.lineWidth = 2
                context.stroke()
                context.closePath()
            } else if (point.constraint === 1) {
                context.beginPath()
                context.moveTo(
                    point.x * zoomScale - 12 * Math.cos(point.alpha),
                    point.y * zoomScale - 12 * Math.sin(point.alpha)
                )
                context.lineTo(
                    point.x * zoomScale + 12 * Math.cos(point.alpha),
                    point.y * zoomScale + 12 * Math.sin(point.alpha)
                )
                context.strokeStyle = "black"
                context.lineWidth = 2
                context.stroke()
                context.closePath()
            }
        })
    }, [drawData, resize, offset, zoomScale, resize])


    // 鼠标摁下
    const handleMouseDown = (event) => {
        event.preventDefault()
        if (event.button === 0) {
            // 左键逻辑
            const { x, y } = getAbsoluteMousePosition(event)
            setAbsoluteMousePosition({ x, y })
            setMouseDown(0)
        } else if (event.button === 1) {
            // 中键逻辑
            const { x, y } = getAbsoluteMousePosition(event)
            setAbsoluteMousePosition({ x, y })
            setMouseDown(1)
        }
    }

    // 移动坐标系
    const offsetDraw = (event) => {
        const { x, y } = getAbsoluteMousePosition(event)
        setOffset({
            x: offset.x + x - absoluteMousePosition.x,
            y: offset.y + y - absoluteMousePosition.y,
        })
        setAbsoluteMousePosition({ x, y })
    }

    // 鼠标移动
    const handleMouseMove = (event) => {
        if (mouseDown === 0) {
            // 左键逻辑
            if (isSpacePressed) {
                offsetDraw(event)
            }
        } else if (mouseDown === 1) {
            // 中键逻辑
            offsetDraw(event)
        }
    }

    // 鼠标抬起
    const handleMouseUp = () => {
        setMouseDown(-1)
    }

    // 滚轮逻辑
    useEffect(() => {
        const canvas = canvasRef.current

        const handleWheel = (event) => {
            event.preventDefault()
            const delta = event.deltaY
            if (isAltPressed && isCtrlPressed) {
                const alpha = isShiftPressed ? 0.3 : 0.1
                const zoomFactor = delta > 0 ? 1 - alpha : 1 + alpha
                setZoomScale(zoomScale * zoomFactor)
                const { x, y } = getMousePosition(event)
                setOffset({
                    x: offset.x + (1 - zoomFactor) * x,
                    y: offset.y + (1 - zoomFactor) * y,
                })
            } else if (isCtrlPressed) {
                const offsetNum = isShiftPressed ? 100 : 10
                const offsetStep = delta > 0 ? -offsetNum : offsetNum
                setOffset({
                    x: offset.x + offsetStep,
                    y: offset.y,
                })
            } else {
                const offsetNum = isShiftPressed ? 100 : 10
                const offsetStep = delta > 0 ? offsetNum : -offsetNum
                setOffset({
                    x: offset.x,
                    y: offset.y + offsetStep,
                })
            }
        }

        // 手动添加 wheel 事件监听器，设置 passive 为 false
        canvas.addEventListener("wheel", handleWheel, { passive: false })

        // 组件卸载时移除事件监听器
        return () => {
            canvas.removeEventListener("wheel", handleWheel)
        }
    }, [isCtrlPressed, isAltPressed, zoomScale, offset])

    // 键盘事件
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Control") {
                setIsCtrlPressed(true)
            } else if (event.key === "Alt") {
                setAltPressed(true)
            } else if (event.key === "Shift") {
                setIsShiftPressed(true)
            } else if (event.key === " ") {
                setIsSpacePressed(true)
            }
        }

        const handleKeyUp = (event) => {
            if (event.key === "Control") {
                setIsCtrlPressed(false)
            } else if (event.key === "Alt") {
                setAltPressed(false)
            } else if (event.key === "Shift") {
                setIsShiftPressed(false)
            } else if (event.key === " ") {
                setIsSpacePressed(false)
            }
        }

        // 绑定键盘按下和抬起事件
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)

        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
        }
    }, [])


    return (
        <div className="show">
            <Head />
            <canvas
                ref={canvasRef}
                className="canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            ></canvas>
        </div>
    )
}

export default Draw
