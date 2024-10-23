import { useContext, useEffect, useRef, useState } from "react"
import Head from "./Head"
import {
    penTypeContext,
    linesContext,
    lineMakingsIdxContext,
    lineMakingsContext,
    saveImageContext,
    pointsContext,
    loadsContext,
    isClearContext,
    isPushContext,
    isGetPdfContext
} from "./context"
import * as msgpack from '@msgpack/msgpack'

const Right = () => {
    const [penType] = useContext(penTypeContext) // 画笔类型
    const canvasRef = useRef(null) // 储存画布的引用
    const [selectedPoint, setSelectedPoint] = useState(-1) // 选中的结点编号
    const [absoluteMousePosition, setAbsoluteMousePosition] = useState({
        x: 0,
        y: 0,
    }) // 鼠标位置
    const [zoomScale, setZoomScale] = useState(100)
    const [offset, setOffset] = useState({ x: 50, y: 50 }) // 原点平移量
    const [mouseDown, setMouseDown] = useState(-1) // 鼠标摁下
    const [isCtrlPressed, setIsCtrlPressed] = useState(false) // 是否按下ctrl键
    const [isAltPressed, setAltPressed] = useState(false) // 是否按下alt键
    const [isShiftPressed, setIsShiftPressed] = useState(false) // 是否按下shift键
    const [isSpacePressed, setIsSpacePressed] = useState(false) // 是否按下空格键
    const [points, setPoints] = useContext(pointsContext)
    const [delPoint, setDelPoint] = useState(-1) // 删除结点编号
    const [selectedLine, setSelectedLine] = useState(-1) // 选中的杆件编号
    const [isDrawLine, setIsDrawLine] = useState(false)
    const [isDrawLoad, setIsDrawLoad] = useState(false)
    const [lines, setLines] = useContext(linesContext)
    const [lineMakingsIdx, setLineMakingsIdx] = useContext(lineMakingsIdxContext)
    const [lineMakings, setLineMakings] = useContext(lineMakingsContext)
    const [loads, setLoads] = useContext(loadsContext)
    const [selectedLoad, setSelectedLoad] = useState(-1)
    const [drawData, setDrawData] = useState({})
    const [resize, setResize] = useState(false)
    const channel = new BroadcastChannel("truss")
    const [loadZoom, setLoadZoom] = useState(100)
    const [isSave, setIsSave] = useContext(saveImageContext)
    const [loading, setLoading] = useState(false)
    const [isClear, setIsClear] = useContext(isClearContext)
    const [isPush, setIsPush] = useContext(isPushContext)
    const [isGetPdf, setIsGetPdf] = useContext(isGetPdfContext)
    const [isTrellis, setIsTrellis] = useState(true)
    const [trellisStep, setTrellisStep] = useState(1)


    useEffect(() => {
        if (trellisStep * zoomScale < 50) {
            setTrellisStep(n => n * 10)
        } else if (trellisStep * zoomScale > 500) {
            setTrellisStep(n => n / 10)
        }
    }, [zoomScale])

    useEffect(() => {
        if (loads.length === 0 && !isPush) return;
        const fetchData = async () => {
            setLoading(true);
            const data = {
                lines: lines,
                points: points,
                loads: loads,
                makings: lineMakings
            }
            const packedData = msgpack.encode(data);

            try {
                const response = await fetch('/api/post/show', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-msgpack'  // 指定内容类型为 MessagePack
                    },
                    body: packedData  // 将数据放在请求体中
                })

                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const unpackedData = msgpack.decode(new Uint8Array(arrayBuffer))
                    setDrawData({ ...unpackedData.received, isLoad: true })
                } else {
                    console.error('Request failed:', response.status)
                }
            } catch (error) {
                console.error('Error:', error)
            }
            setLoading(false)
        }
        loading || fetchData()
        setIsPush(false)
    }, [points, loads, lines, lineMakings, isPush])

    useEffect(() => {
        const downloadPdf = async () => {
            setLoading(true);
            const data = {
                lines: lines,
                points: points,
                loads: loads,
                makings: lineMakings
            };
            const packedData = msgpack.encode(data)

            try {
                const response = await fetch('/api/post/pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-msgpack'
                    },
                    body: packedData
                })

                if (response.ok) {
                    const packedData = await response.arrayBuffer()
                    const pdfData = msgpack.decode(new Uint8Array(packedData))

                    const blob = new Blob([pdfData], { type: 'application/pdf' })
                    const link = document.createElement('a')
                    link.href = window.URL.createObjectURL(blob)
                    link.download = 'truss_structure.pdf'
                    link.click()
                }
            } catch (error) {
                console.error('Error downloading PDF:', error)
            }
            setLoading(false)
        }
        if (isGetPdf) {
            loading || downloadPdf()
            setIsGetPdf(false)
        }
    }, [isGetPdf])

    useEffect(() => {
        if (isClear) {
            setPoints([])
            setLines([])
            setLoads([])
            setLineMakings([{ name: 'Normal', E: 4.8e6, A: 1, rho: 0, color: '#66ccff' }])
            setSelectedPoint(-1)
            setSelectedLine(-1)
            setSelectedLoad(-1)
            setLineMakingsIdx(0)
            setDrawData({})
            setIsClear(false)
        }
    }, [isClear])

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

    useEffect(() => {
        if (loads.length === 0) {
            setDrawData({
                isLoad: false,
                lines: lines,
                points: points,
            })
        }
    }, [lines, points])

    useEffect(() => {
        channel.postMessage(drawData)
    }, [drawData])

    // 更改canvas大小
    const resizeCanvas = () => {
        setResize(n => !n)
        const canvas = canvasRef.current
        if (canvas) {
            console.log(canvas.clientHeight)
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
        }
    }

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

    const getSelectedPoint = (event) => {
        const { x, y } = getMousePosition(event)
        const clickedPointIndex = points.findIndex(
            (point) =>
                Math.hypot(point.x * zoomScale - x, point.y * zoomScale - y) <
                10
        )
        return clickedPointIndex
    }

    const getSelectedLine = (event) => {

        const { x, y } = getMousePosition(event)
        const clickedLineIndex = lines.findIndex((line) => {
            const startIdx = line.points[0]
            const endIdx = line.points[1]
            const l1 = Math.hypot(points[startIdx].x * zoomScale - x, points[startIdx].y * zoomScale - y)
            const l2 = Math.hypot(points[endIdx].x * zoomScale - x, points[endIdx].y * zoomScale - y)
            const L = Math.hypot(points[startIdx].x * zoomScale - points[endIdx].x * zoomScale, points[startIdx].y * zoomScale - points[endIdx].y * zoomScale)
            return l1 + l2 <= L + 1
        })
        return clickedLineIndex
    }

    const getSelectedLoad = (event) => {
        const { x, y } = getMousePosition(event)
        const clickedLoadIndex = loads.findIndex((load) => {
            const [startx, starty] = [points[load.point].x, points[load.point].y]
            const [endx, endy] = [load.Fx / loadZoom + startx, load.Fy / loadZoom + starty]
            const l1 = Math.hypot(startx * zoomScale - x, starty * zoomScale - y)
            const l2 = Math.hypot(endx * zoomScale - x, endy * zoomScale - y)
            const L = Math.hypot(startx * zoomScale - endx * zoomScale, starty * zoomScale - endy * zoomScale)
            return l1 + l2 <= L + 1
        })
        return clickedLoadIndex
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

    // canvas元素绘制
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        // 每次更新坐标系时，重置之前的变换
        context.setTransform(1, 0, 0, 1, 0, 0) // 重置所有变换
        console.log(canvas.height)
        context.translate(offset.x, canvas.height - offset.y) // 平移原点
        context.scale(1, -1) // 翻转 y 轴

        context.clearRect(-offset.x, -offset.y, canvas.width, canvas.height) // 清空整个画布
        context.beginPath()
        context.strokeStyle = '#000000'
        context.lineWidth = 1.5
        context.moveTo(-offset.x, 0)
        context.lineTo(canvas.width - offset.x, 0) // x 轴
        context.moveTo(0, -offset.y)
        context.lineTo(0, canvas.height - offset.y) // y 轴
        context.stroke()

        if (isTrellis) {
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


        lines.forEach((line, idx) => {
            if (idx === selectedLine) {
                context.shadowColor = 'rgba(0, 0, 0, 0.5)'
                context.shadowBlur = 10
                context.shadowOffsetX = 5
                context.shadowOffsetY = 5
            }
            context.beginPath()
            const start = line.points[0]
            const end = line.points[1]
            context.moveTo(
                points[start].x * zoomScale,
                points[start].y * zoomScale
            )
            if (typeof end === "number") {
                context.lineTo(
                    points[end].x * zoomScale,
                    points[end].y * zoomScale
                )
            } else {
                context.lineTo(end.x * zoomScale, end.y * zoomScale)
                console.log(end.x, end.y)
            }
            context.strokeStyle = lineMakings[line.makingsIdx].color
            context.lineWidth = idx === selectedLine ? 4 : 3
            context.stroke()
            context.closePath()
            context.shadowColor = 'transparent' // 关闭阴影
            context.shadowBlur = 0
            context.shadowOffsetX = 0
            context.shadowOffsetY = 0
        })

        loads.forEach((load, idx) => {
            if (idx === selectedLoad) {
                context.shadowColor = 'rgba(0, 0, 0, 0.5)'
                context.shadowBlur = 10
                context.shadowOffsetX = 5
                context.shadowOffsetY = 5
            }
            const startx = points[load.point].x * zoomScale
            const starty = points[load.point].y * zoomScale
            const endx = load.Fx / loadZoom * zoomScale + startx
            const endy = load.Fy / loadZoom * zoomScale + starty
            drawArrow(context, startx, starty, endx, endy)
            context.shadowColor = 'transparent' // 关闭阴影
            context.shadowBlur = 0
            context.shadowOffsetX = 0
            context.shadowOffsetY = 0
        })

        // 绘制点
        points.forEach((point, idx) => {
            context.beginPath()
            context.arc(
                point.x * zoomScale,
                point.y * zoomScale,
                4,
                0,
                Math.PI * 2,
                true
            )
            context.fillStyle = idx === selectedPoint ? "red" : "blue"
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
    }, [points, selectedPoint, offset, zoomScale, lines, selectedLine, loads, selectedLoad, resize, lineMakings, loadZoom, isTrellis, trellisStep])

    // 删除点
    useEffect(() => {
        if (delPoint !== -1) {
            setPoints(points.filter((_, idx) => idx !== delPoint))
            setDelPoint(-1)
            setSelectedPoint(-1)
            setSelectedLoad(-1)
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
                        }
                    })
            )
            setLoads(
                loads.filter(
                    (load) =>
                        !(load.point === delPoint)
                )
            )
        }
    }, [delPoint])

    // 鼠标摁下
    const handleMouseDown = (event) => {
        console.log(lines)
        event.preventDefault()
        if (event.button === 0) {
            // 左键逻辑
            setMouseDown(0)
            if (isSpacePressed || penType === "grab") {
                const { x, y } = getAbsoluteMousePosition(event)
                setAbsoluteMousePosition({ x, y })
            } else if (penType === "point") {
                setSelectedLine(-1)
                setSelectedLoad(-1)
                const { x, y } = getMousePosition(event)
                const clickedPointIndex = getSelectedPoint(event)
                setSelectedPoint(clickedPointIndex)
                if (clickedPointIndex === -1) {
                    setSelectedPoint(points.length)
                    setPoints([
                        ...points,
                        { x: x / zoomScale, y: y / zoomScale, Constraint_Type: 0, theta: 0 },
                    ])
                }
            } else if (penType === "line") {
                // 画线逻辑
                const clickedPointIndex = getSelectedPoint(event)
                const { x, y } = getMousePosition(event)
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
                    )
                    setIsDrawLine(false)
                    setSelectedPoint(-1)
                } else if (
                    clickedPointIndex !== -1 &&
                    clickedPointIndex !== selectedPoint
                ) {
                    setSelectedPoint(clickedPointIndex)
                    setSelectedLine(lines.length)
                    setLines([
                        ...lines,
                        { points: [clickedPointIndex, { x: x / zoomScale, y: y / zoomScale }], makingsIdx: lineMakingsIdx },
                    ])
                    setIsDrawLine(true)
                } else if (clickedPointIndex === -1 && !isDrawLine) {
                    const lineIdx = getSelectedLine(event)
                    setSelectedLine(lineIdx)
                }
            } else if (penType === "constraint2") {
                const clickedPointIndex = getSelectedPoint(event)
                setSelectedPoint(clickedPointIndex)
                if (clickedPointIndex !== -1) {
                    setPoints(
                        points.map((point, idx) =>
                            idx === clickedPointIndex
                                ? {
                                    ...point,
                                    Constraint_Type: point.Constraint_Type === 2 ? 0 : 2,
                                }
                                : point
                        )
                    )
                }
            } else if (penType === "constraint1") {
                const clickedPointIndex = getSelectedPoint(event)
                setSelectedPoint(clickedPointIndex)
                if (clickedPointIndex !== -1) {
                    setPoints(
                        points.map((point, idx) =>
                            idx === clickedPointIndex
                                ? {
                                    ...point,
                                    Constraint_Type: point.Constraint_Type === 1 ? 0 : 1,
                                    theta: 0
                                }
                                : point
                        )
                    )
                }
            } else if (penType === "load") {
                const clickedLoadIndex = getSelectedLoad(event)
                const clickedPointIndex = getSelectedPoint(event)
                setSelectedPoint(clickedPointIndex)
                if (clickedPointIndex !== -1 && !isDrawLoad) {
                    setSelectedLoad(loads.length)
                    setIsDrawLoad(true)
                    setLoads(
                        [...loads, { point: clickedPointIndex, Fx: 0, Fy: 0 }]
                    )
                } else if (isDrawLoad) {
                    setIsDrawLoad(false)
                } else if (clickedLoadIndex !== -1) {
                    setSelectedLoad(clickedLoadIndex)
                } else {
                    setSelectedLoad(-1)
                }
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
            if (penType === "grab" || isSpacePressed) {
                offsetDraw(event)
            } else if (penType === "point") {
                let { x, y } = getMousePosition(event)
                if (isTrellis && (Math.abs(x / zoomScale) % trellisStep * zoomScale < 3 || Math.abs(x / zoomScale) % trellisStep * zoomScale > trellisStep * zoomScale - 3)) {
                    x = Math.round(x / zoomScale / trellisStep) * trellisStep
                } else {
                    x = x / zoomScale
                }
                if (isTrellis && (Math.abs(y / zoomScale) % trellisStep * zoomScale < 3 || Math.abs(y / zoomScale) % trellisStep * zoomScale > trellisStep * zoomScale - 3)) {
                    y = Math.round(y / zoomScale / trellisStep) * trellisStep
                } else {
                    y = y / zoomScale
                }
                setPoints(
                    points.map((point, idx) =>
                        idx === selectedPoint
                            ? { ...point, x: x, y: y }
                            : point
                    )
                )
            }
        } else if (mouseDown === 1) {
            // 中键逻辑
            offsetDraw(event)
        }
        if (isDrawLine) {
            const { x, y } = getMousePosition(event)
            setLines(
                lines.map((line, idx) =>
                    idx === selectedLine
                        ? {
                            ...line,
                            points: [line.points[0], { x: x / zoomScale, y: y / zoomScale }],
                        }
                        : line
                )
            )
        } else if (isDrawLoad) {
            let { x, y } = getMousePosition(event)
            if (isTrellis) {
                if (Math.abs(x / zoomScale) % trellisStep * zoomScale < 3 || Math.abs(x / zoomScale) % trellisStep * zoomScale > trellisStep * zoomScale - 3) {
                    x = Math.round(x / zoomScale / trellisStep) * trellisStep * zoomScale
                }
                if (Math.abs(y / zoomScale) % trellisStep * zoomScale < 3 || Math.abs(y / zoomScale) % trellisStep * zoomScale > trellisStep * zoomScale - 3) {
                    y = Math.round(y / zoomScale / trellisStep) * trellisStep * zoomScale
                }
            }
            setLoads(
                loads.map((load, idx) =>
                    idx === selectedLoad
                        ? {
                            ...load,
                            Fx: Math.abs(x - points[load.point].x * zoomScale) < 3 ? 0 : (x / zoomScale - points[load.point].x) * loadZoom,
                            Fy: Math.abs(y - points[load.point].y * zoomScale) < 3 ? 0 : (y / zoomScale - points[load.point].y) * loadZoom
                        }
                        : load
                )
            )
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
        <div className="right">
            <Head
                selectedPointSet={[selectedPoint, setSelectedPoint]}
                delPointSet={[delPoint, setDelPoint]}
                pointsSet={[points, setPoints]}
                canvasRef={canvasRef}
                selectedLineSet={[selectedLine, setSelectedLine]}
                linesSet={[lines, setLines]}
                zoomScaleSet={[zoomScale, setZoomScale]}
                offsetSet={[offset, setOffset]}
                loadsSet={[loads, setLoads]}
                selectedLoadSet={[selectedLoad, setSelectedLoad]}
                loadZoomSet={[loadZoom, setLoadZoom]}
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

export default Right
