import { useContext, useEffect, useRef, useState } from "react"
import Head from "./Head"

// 颜色映射函数
const getColorFromSigma = (sigma, minSigma, maxSigma) => {
    const normalizedSigma = (sigma - minSigma) / (maxSigma - minSigma)
    const hue = (1 - normalizedSigma) * 240 // 240 为蓝色，0 为红色
    return `hsl(${hue}, 100%, 50%)`
}

const Show = () => {
    const canvasRef = useRef(null) // 储存画布的引用
    const [zoomScale, setZoomScale] = useState(100)
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
    const [dispScale, setDispScale] = useState(100)
    const [loadZoom, setLoadZoom] = useState(100)
    const [isSave, setIsSave] = useState(false)
    const [penType, setPenType] = useState(null)
    const [selectedLine, setSelectedLine] = useState(-1)
    const [selectedPoint, setSelectedPoint] = useState(-1)
    const [selected, setSelected] = useState({})
    const [isAbs, setIsAbs] = useState(false)
    const [isTrellis, setIsTrellis] = useState(true)
    const [trellisStep, setTrellisStep] = useState(1)


    useEffect(() => {
        if (trellisStep * zoomScale < 50) {
            setTrellisStep(n => n * 10)
        } else if (trellisStep * zoomScale > 500) {
            setTrellisStep(n => n / 10)
        }
    }, [zoomScale])

    const saveImage = () => {
        const canvas = canvasRef.current
        const image = canvas.toDataURL('image/png')

        const link = document.createElement('a')
        link.href = image
        link.download = 'canvas_image.png'
        link.click()
    }

    useEffect(() => {
        if (isSave) {
            saveImage()
            setIsSave(false)
        }
    }, [isSave])

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
        if (selectedPoint !== -1) {
            setSelected({ type: "point", ...drawData.points[selectedPoint] })
        } else if (selectedLine !== -1) {
            setSelected({ type: "line", ...drawData.lines[selectedLine] })
        } else {
            setSelected({ type: "none" })
        }
    }, [selectedLine, selectedPoint, drawData])

    const getSelectedLine = (event) => {
        const { x, y } = getMousePosition(event)
        const clickedLineIndex = drawData.lines.findIndex((line) => {
            const startIdx = line.points[0]
            const endIdx = line.points[1]
            const startx = (drawData.points[startIdx].x + drawData.points[startIdx].dx * dispScale) * zoomScale
            const starty = (drawData.points[startIdx].y + drawData.points[startIdx].dy * dispScale) * zoomScale
            const endx = (drawData.points[endIdx].x + drawData.points[endIdx].dx * dispScale) * zoomScale
            const endy = (drawData.points[endIdx].y + drawData.points[endIdx].dy * dispScale) * zoomScale
            const l1 = Math.hypot(startx - x, starty - y)
            const l2 = Math.hypot(endx - x, endy - y)
            const L = Math.hypot(startx - endx, starty - endy)
            return l1 + l2 <= L + 1
        })
        return clickedLineIndex
    }

    const getSelectedPoint = (event) => {
        const { x, y } = getMousePosition(event)
        const clickedPointIndex = drawData.points.findIndex(
            (point) =>
                Math.hypot((point.x + point.dx * dispScale) * zoomScale - x, (point.y + point.dy * dispScale) * zoomScale - y) <
                10
        )
        return clickedPointIndex
    }

    const drawArrow = (ctx, fromX, fromY, toX, toY, arrowWidth = 10, color = 'black') => {
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = 2

        const angle = Math.atan2(toY - fromY, toX - fromX)

        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.stroke()

        const headLength = arrowWidth
        const arrowX1 = toX - headLength * Math.cos(angle - Math.PI / 6)
        const arrowY1 = toY - headLength * Math.sin(angle - Math.PI / 6)
        const arrowX2 = toX - headLength * Math.cos(angle + Math.PI / 6)
        const arrowY2 = toY - headLength * Math.sin(angle + Math.PI / 6)

        ctx.beginPath()
        ctx.moveTo(toX, toY)
        ctx.lineTo(arrowX1, arrowY1)
        ctx.lineTo(arrowX2, arrowY2)
        ctx.closePath()
        ctx.fill()
    }

    useEffect(() => {
        const channel = new BroadcastChannel("truss")
        const headleMessage = (event) => {
            console.log(event)
            const data = event.data
            if (data.points) {
                setDrawData(data)
            }
            setSelectedPoint(-1)
            setSelectedLine(-1)
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
        
        if (isTrellis) {
            context.beginPath()
            context.strokeStyle = '#000000'
            context.lineWidth = 1.5
            context.moveTo(-offset.x, 0)
            context.lineTo(canvas.width - offset.x, 0) // x 轴
            context.moveTo(0, -offset.y)
            context.lineTo(0, canvas.height - offset.y) // y 轴
            context.stroke()
            for (let i = 0; trellisStep * zoomScale * i < canvas.width - offset.x; i++) {
                if (trellisStep * zoomScale * i > - offset.x) {
                    context.beginPath()
                    context.strokeStyle = '#e8e8e8'
                    context.lineWidth = 0.5
                    context.moveTo(trellisStep * zoomScale * i, -offset.y)
                    context.lineTo(trellisStep * zoomScale * i, canvas.height - offset.y)
                    context.stroke()
                }
            }
            for (let i = -1; trellisStep * zoomScale * i > -offset.x; i--) {
                if (trellisStep * zoomScale * i < canvas.width - offset.x) {
                    context.beginPath()
                    context.strokeStyle = '#e8e8e8'
                    context.lineWidth = 0.5
                    context.moveTo(trellisStep * zoomScale * i, -offset.y)
                    context.lineTo(trellisStep * zoomScale * i, canvas.height - offset.y)
                    context.stroke()
                }
            }
            for (let i = 0; trellisStep * zoomScale * i < canvas.height - offset.y; i++) {
                if (trellisStep * zoomScale * i > - offset.y) {
                    context.beginPath()
                    context.strokeStyle = '#e8e8e8'
                    context.lineWidth = 0.5
                    context.moveTo(-offset.x, trellisStep * zoomScale * i)
                    context.lineTo(canvas.width - offset.x, trellisStep * zoomScale * i)
                    context.stroke()
                }
            }
            for (let i = -1; trellisStep * zoomScale * i > -offset.y; i--) {
                if (trellisStep * zoomScale * i < canvas.height - offset.y) {
                    context.beginPath()
                    context.strokeStyle = '#e8e8e8'
                    context.lineWidth = 0.5
                    context.moveTo(-offset.x, trellisStep * zoomScale * i)
                    context.lineTo(canvas.width - offset.x, trellisStep * zoomScale * i)
                    context.stroke()
                }
            }
        }

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
                    context.lineTo(end.x * zoomScale, end.y * zoomScale)
                }
                context.strokeStyle = "#39c5bb"
                context.lineWidth = 3
                context.stroke()
                context.closePath()
                context.shadowColor = "transparent" // 关闭阴影
                context.shadowBlur = 0
                context.shadowOffsetX = 0
                context.shadowOffsetY = 0
            })

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
                if (point.Constraint_Type === 2) {
                    context.beginPath()
                    context.moveTo(
                        point.x * zoomScale,
                        point.y * zoomScale
                    )
                    context.lineTo(
                        point.x * zoomScale - 12,
                        point.y * zoomScale - 12
                    )
                    context.lineTo(
                        point.x * zoomScale + 12,
                        point.y * zoomScale - 12
                    )
                    context.lineTo(
                        point.x * zoomScale,
                        point.y * zoomScale
                    )
                    context.strokeStyle = 'black'
                    context.lineWidth = 2
                    context.stroke()
                    context.closePath()
                } else if (point.Constraint_Type === 1) {
                    context.beginPath()
                    context.moveTo(
                        point.x * zoomScale - 12 * Math.cos(point.theta),
                        point.y * zoomScale - 12 * Math.sin(point.theta)
                    )
                    context.lineTo(
                        point.x * zoomScale + 12 * Math.cos(point.theta),
                        point.y * zoomScale + 12 * Math.sin(point.theta)
                    )
                    context.strokeStyle = 'black'
                    context.lineWidth = 2
                    context.stroke()
                    context.closePath()
                }
            })

        } else if (drawData.isLoad) {
            let sigmas
            if (isAbs) {
                sigmas = drawData.lines.map(line => Math.abs(line.sigma))
            } else {
                sigmas = drawData.lines.map(line => line.sigma)
            }
            const minSigma = Math.min(...sigmas)
            const maxSigma = Math.max(...sigmas)


            // 绘制线条（杆件）
            drawData.lines.forEach((line, idx) => {
                const [startIdx, endIdx] = line.points
                const start = drawData.points[startIdx]
                const end = drawData.points[endIdx]
                if (idx === selectedLine) {
                    context.shadowColor = 'rgba(0, 0, 0, 0.5)'
                    context.shadowBlur = 10
                    context.shadowOffsetX = 5
                    context.shadowOffsetY = 5
                }
                // 根据 sigma 值选择颜色
                if (isAbs) {
                    context.strokeStyle = getColorFromSigma(Math.abs(line.sigma), minSigma, maxSigma)
                } else {
                    context.strokeStyle = getColorFromSigma(line.sigma, minSigma, maxSigma)
                }
                context.lineWidth = 3

                // 绘制杆件
                context.beginPath()
                context.moveTo((start.x + start.dx * dispScale) * zoomScale, (start.y + start.dy * dispScale) * zoomScale)
                context.lineTo((end.x + end.dx * dispScale) * zoomScale, (end.y + end.dy * dispScale) * zoomScale)
                context.stroke()
                context.shadowColor = 'transparent' // 关闭阴影
                context.shadowBlur = 0
                context.shadowOffsetX = 0
                context.shadowOffsetY = 0
            })

            drawData.loads.forEach((load, idx) => {
                const startx = (drawData.points[load.point].x + drawData.points[load.point].dx * dispScale) * zoomScale
                const starty = (drawData.points[load.point].y + drawData.points[load.point].dy * dispScale) * zoomScale
                const endx = load.Fx / loadZoom * zoomScale + startx
                const endy = load.Fy / loadZoom * zoomScale + starty
                drawArrow(context, startx, starty, endx, endy)
            })

            // 绘制节点
            drawData.points.forEach((point, idx) => {
                context.fillStyle = idx === selectedPoint ? "red" : "blue"
                context.beginPath()
                context.arc((point.x + point.dx * dispScale) * zoomScale, (point.y + point.dy * dispScale) * zoomScale, 5, 0, Math.PI * 2)
                context.fill()
                if (point.Constraint_Type === 2) {
                    context.beginPath()
                    context.moveTo(
                        point.x * zoomScale,
                        point.y * zoomScale
                    )
                    context.lineTo(
                        point.x * zoomScale - 12,
                        point.y * zoomScale - 12
                    )
                    context.lineTo(
                        point.x * zoomScale + 12,
                        point.y * zoomScale - 12
                    )
                    context.lineTo(
                        point.x * zoomScale,
                        point.y * zoomScale
                    )
                    context.strokeStyle = 'black'
                    context.lineWidth = 2
                    context.stroke()
                    context.closePath()
                } else if (point.Constraint_Type === 1) {
                    context.beginPath()
                    context.moveTo(
                        (point.x + point.dx) * zoomScale - 12 * Math.cos(point.theta),
                        (point.y + point.dy) * zoomScale - 12 * Math.sin(point.theta)
                    )
                    context.lineTo(
                        point.x * zoomScale + 12 * Math.cos(point.theta),
                        point.y * zoomScale + 12 * Math.sin(point.theta)
                    )
                    context.strokeStyle = 'black'
                    context.lineWidth = 2
                    context.stroke()
                    context.closePath()
                }
            })

            const canvasHeight = canvas.height
            const canvasWidth = canvas.width

            // 绘制颜色条 (分成多个小段，确保每一小段的颜色和杆件颜色一致)
            const barWidth = canvasWidth - 120
            const barHeight = 20
            const steps = 100  // 颜色条的分段数
            for (let i = 0; i < steps; i++) {
                const sigma = minSigma + (i / steps) * (maxSigma - minSigma)
                context.fillStyle = getColorFromSigma(sigma, minSigma, maxSigma)
                context.fillRect(60 - offset.x + (i / steps) * barWidth, 30 - offset.y, barWidth / steps, barHeight)
            }

            context.save(); // 保存当前 canvas 状态
            // 临时恢复正常的坐标系
            context.scale(1, -1);
            // 绘制最小和最大应力值
            context.fillStyle = 'black'
            context.font = '14px Arial'
            const Max = `Max Sigma: ${maxSigma.toFixed(2)}`
            const textMetrics = context.measureText(Max)
            const textWidth = textMetrics.width;
            context.fillText(`Min Sigma: ${minSigma.toFixed(2)}`, 60 - offset.x, -(30 - offset.y + barHeight + 10))
            context.fillText(`Max Sigma: ${maxSigma.toFixed(2)}`, 60 - offset.x + barWidth - textWidth, -(30 - offset.y + barHeight + 10))
            context.restore() // 恢复到反转坐标之前的状态
        }

    }, [drawData, resize, offset, zoomScale, resize, dispScale, loadZoom, selectedLine, isAbs, selectedPoint, isTrellis, trellisStep])


    // 鼠标摁下
    const handleMouseDown = (event) => {
        event.preventDefault()
        if (event.button === 0) {
            // 左键逻辑
            const { x, y } = getAbsoluteMousePosition(event)
            setAbsoluteMousePosition({ x, y })
            setMouseDown(0)
            if (penType === "choose" && drawData.isLoad) {
                const clickedLineIndex = getSelectedLine(event)
                setSelectedLine(clickedLineIndex)
                const clickedPointIndex = getSelectedPoint(event)
                setSelectedPoint(clickedPointIndex)
            }
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
            if (isSpacePressed || penType === "grab") {
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
            <Head
                zoomScaleSet={[zoomScale, setZoomScale]}
                offsetSet={[offset, setOffset]}
                saved={setIsSave}
                penTypeSet={[penType, setPenType]}
                selected={selected}
                dispScaleSet={[dispScale, setDispScale]}
                loadZoomSet={[loadZoom, setLoadZoom]}
                isAbsSet={[isAbs, setIsAbs]}
                isTrellisSet={[isTrellis, setIsTrellis]}
                trellisStepSet={[trellisStep, setTrellisStep]}
            />
            <div className="canvas">
                <canvas
                    ref={canvasRef}
                    className="canvas"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                ></canvas>
            </div>
        </div>
    )
}

export default Show
