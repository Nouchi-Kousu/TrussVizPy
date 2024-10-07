import React, { useRef, useState, useEffect } from "react"

const CanvasWithCircles = () => {
    const canvasRef = useRef(null)
    const [circles, setCircles] = useState([])
    const [lines, setLines] = useState([]) // 保存线
    const [draggingCircleIndex, setDraggingCircleIndex] = useState(null)
    const [newCircle, setNewCircle] = useState(null)
    const [dragging, setDragging] = useState(false)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [selectedCircle, setSelectedCircle] = useState(null) // 存储选中的圆
    const [lineMode, setLineMode] = useState(false) // 用于区分是否正在绘制线
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }) // 鼠标位置

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        context.clearRect(0, 0, canvas.width, canvas.height)

        // 绘制已有的圆
        circles.forEach((circle) => {
            context.beginPath()
            context.arc(circle.x, circle.y, 10, 0, Math.PI * 2, true)
            context.fillStyle = "blue"
            context.fill()
            context.closePath()
        })

        // 绘制所有已保存的线
        lines.forEach((line) => {
            context.beginPath()
            context.moveTo(line.start.x, line.start.y)
            context.lineTo(line.end.x, line.end.y)
            context.strokeStyle = "black"
            context.lineWidth = 2
            context.stroke()
            context.closePath()
        })

        // 绘制正在创建但尚未确定位置的圆
        if (newCircle) {
            context.beginPath()
            context.arc(newCircle.x, newCircle.y, 10, 0, Math.PI * 2, true)
            context.fillStyle = "blue"
            context.fill()
            context.closePath()
        }

        // 如果有选择的圆，并且是绘制线模式，绘制从圆心到鼠标的临时线
        if (selectedCircle && lineMode) {
            context.beginPath()
            context.moveTo(selectedCircle.x, selectedCircle.y)
            context.lineTo(mousePosition.x, mousePosition.y)
            context.strokeStyle = "red"
            context.lineWidth = 2
            context.stroke()
            context.closePath()
        }

        // 显示鼠标坐标
        context.font = "16px Arial"
        context.fillStyle = "black"
        context.fillText(
            `Mouse: (${mousePosition.x}, ${mousePosition.y})`,
            mousePosition.x + 10,
            mousePosition.y + 10
        )
    }, [circles, lines, newCircle, selectedCircle, lineMode, mousePosition])

    const getMousePosition = (event) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
    }

    const handleMouseDown = (event) => {
        const { x, y } = getMousePosition(event)
        const isRightClick = event.button === 2

        if (isRightClick) {
            // 右键单击，删除线段和圆
            const clickedCircleIndex = circles.findIndex(
                (circle) => Math.hypot(circle.x - x, circle.y - y) < 10
            )

            if (clickedCircleIndex !== -1) {
                // 删除圆
                const updatedCircles = circles.filter(
                    (_, index) => index !== clickedCircleIndex
                )
                setCircles(updatedCircles)
                return
            }

            const clickedLineIndex = lines.findIndex(
                (line) =>
                    Math.hypot(line.start.x - x, line.start.y - y) < 10 ||
                    Math.hypot(line.end.x - x, line.end.y - y) < 10
            )

            if (clickedLineIndex !== -1) {
                // 删除线
                const updatedLines = lines.filter(
                    (_, index) => index !== clickedLineIndex
                )
                setLines(updatedLines)
                return
            }

            return // 右键单击时不进行其他操作
        }

        // 左键单击的处理逻辑
        const clickedCircleIndex = circles.findIndex(
            (circle) => Math.hypot(circle.x - x, circle.y - y) < 10
        )

        if (clickedCircleIndex !== -1 && !lineMode) {
            // 开始拖动已有圆
            setDraggingCircleIndex(clickedCircleIndex)
            setOffset({
                x: x - circles[clickedCircleIndex].x,
                y: y - circles[clickedCircleIndex].y,
            })
            setDragging(true)
        } else if (clickedCircleIndex !== -1 && lineMode) {
            // 如果是绘制线模式
            if (selectedCircle) {
                const secondCircle = circles[clickedCircleIndex]
                setLines([
                    ...lines,
                    { start: selectedCircle, end: secondCircle },
                ])
                setSelectedCircle(null)
                setLineMode(false)
            } else {
                setSelectedCircle(circles[clickedCircleIndex])
            }
        } else {
            // 开始创建新圆
            setNewCircle({ x, y })
            setDragging(true)
        }
    }

    const handleMouseMove = (event) => {
        const { x, y } = getMousePosition(event)
        setMousePosition({ x, y })

        if (dragging && draggingCircleIndex !== null) {
            // 如果在拖动已有的圆，更新圆的位置
            const updatedCircles = circles.map((circle, index) =>
                index === draggingCircleIndex
                    ? { ...circle, x: x - offset.x, y: y - offset.y }
                    : circle
            )
            setCircles(updatedCircles)
        } else if (dragging && newCircle) {
            // 如果在创建新的圆，更新其位置
            setNewCircle({ x, y })
        }
    }

    const handleMouseUp = () => {
        if (newCircle) {
            // 如果是新建的圆，松开鼠标时将圆加入到数组中
            setCircles([...circles, newCircle])
            setNewCircle(null)
        }
        setDragging(false)
        setDraggingCircleIndex(null)
    }

    const handleMouseLeave = () => {
        // 防止鼠标离开时依然在拖动或创建圆
        setDragging(false)
        setNewCircle(null)
        setDraggingCircleIndex(null)
    }

    const handleDoubleClick = (event) => {
        const { x, y } = getMousePosition(event)
        const clickedCircleIndex = circles.findIndex(
            (circle) => Math.hypot(circle.x - x, circle.y - y) < 10
        )

        if (clickedCircleIndex !== -1) {
            // 进入绘制线模式
            setLineMode(true)
            setSelectedCircle(circles[clickedCircleIndex])
        }
    }

    const handleCirclePositionChange = (index, axis, value) => {
        const updatedCircles = circles.map((circle, i) =>
            i === index
                ? { ...circle, [axis]: parseInt(value, 10) || 0 }
                : circle
        )
        setCircles(updatedCircles)
    }

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                style={{ border: "1px solid black" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onDoubleClick={handleDoubleClick} // 处理双击以选择圆
                onContextMenu={(e) => e.preventDefault()} // 禁用右键菜单
            />

            <div>
                <h3>Circles List:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Index</th>
                            <th>X</th>
                            <th>Y</th>
                        </tr>
                    </thead>
                    <tbody>
                        {circles.map((circle, index) => (
                            <tr key={index}>
                                <td>{index}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={circle.x}
                                        onChange={(e) =>
                                            handleCirclePositionChange(
                                                index,
                                                "x",
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={circle.y}
                                        onChange={(e) =>
                                            handleCirclePositionChange(
                                                index,
                                                "y",
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CanvasWithCircles
