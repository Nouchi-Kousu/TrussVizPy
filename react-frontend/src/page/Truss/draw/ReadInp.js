import React, { useContext, useEffect, useState } from 'react'
import { pointsContext, linesContext, loadsContext, lineMakingsContext } from './context'

// 前面定义的转换函数
function frontendInputDataToTxt(data) {
    let result = ''

    data.points.forEach(point => {
        result += `P,${point.x},${point.y},${point.Constraint_Type},${point.theta}\n`
    })

    data.lines.forEach(line => {
        result += `L,${line.points[0]},${line.points[1]},${line.makingsIdx}\n`
    })

    data.makings.forEach(making => {
        const name = making.name || ''
        const color = making.color || ''
        result += `M,${name},${making.E},${making.A},${making.rho},${color}\n`
    })

    return result
}

function txtToFrontendInputData(txt) {
    const data = {
        points: [],
        lines: [],
        loads: [],
        makings: []
    }

    const lines = txt.split('\n')
    lines.forEach((line, idx) => {
        const tokens = line.trim().split(',')
        if (tokens[0] === 'P') {
            data.points.push({
                x: parseFloat(tokens[1]),
                y: parseFloat(tokens[2]),
                Constraint_Type: parseInt(tokens[3], 10),
                theta: parseFloat(tokens[4])
            })
        } else if (tokens[0] === 'L') {
            data.lines.push({
                points: [parseInt(tokens[1], 10), parseInt(tokens[2], 10)],
                makingsIdx: parseInt(tokens[3], 10)
            })
        } else if (tokens[0] === 'M') {
            data.makings.push({
                name: tokens[1] || idx,
                E: parseFloat(tokens[2]),
                A: parseFloat(tokens[3]),
                rho: parseFloat(tokens[4]),
                color: tokens[5] || '#000000'
            })
        }
    })

    return data
}

function handleFileUpload(event, onDataParsed) {
    const file = event.target.files[0]
    if (!file) {
        alert('未选择文件')
        return
    }

    const reader = new FileReader()
    reader.onload = function (e) {
        const txt = e.target.result
        const data = txtToFrontendInputData(txt)
        onDataParsed(data)
    }
    reader.onerror = function () {
        alert('读取文件时出错')
    }
    reader.readAsText(file, 'UTF-8')
}

const ReadInp = ({ isReadInpSet }) => {
    const [frontendData, setFrontendData] = useState(null)
    const [txtContent, setTxtContent] = useState('')
    const [points, setPoints] = useContext(pointsContext)
    const [lines, setLines] = useContext(linesContext)
    const [loads, setLoads] = useContext(loadsContext)
    const [makings, setMakings] = useContext(lineMakingsContext)
    const [isReadInp, setIsReadInp] = isReadInpSet

    // 处理文件上传
    const onFileUpload = (event) => {
        handleFileUpload(event, setFrontendData)
    }

    useEffect(() => {
        if (frontendData) {
            setPoints([...frontendData.points])
            setLines([...frontendData.lines])
            setLoads([...frontendData.loads])
            setMakings([...frontendData.makings])
        }
    }, [frontendData])

    // 下载当前 frontendData 为 .txt 文件
    const downloadTxtFile = () => {
        if (!frontendData) {
            alert('没有数据可下载')
            return
        }
        const txt = frontendInputDataToTxt(frontendData)
        const blob = new Blob([txt], { type: 'text/plaincharset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'data.txt'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="modal-overlay" onClick={() => setIsReadInp(false)}>
            <div className="set" onClick={(e) => e.stopPropagation()} >
                <h2>Truss Data Manager</h2>
                <input type="file" accept=".txt" onChange={onFileUpload} />

                {/* 显示解析后的数据 */}

                {/* 下载按钮 */}
                <button onClick={downloadTxtFile}>下载为 .txt 文件</button>
            </div>
        </div >
    )
}

export default ReadInp
