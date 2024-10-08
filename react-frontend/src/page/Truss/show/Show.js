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
    
    // 更改canvas大小
    const resizeCanvas = () => {
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
    }, [drawData])

    return (
        <div className="show">
            <Head />
            <canvas ref={canvasRef} className="canvas"></canvas>
        </div>
    )
}

export default Draw
