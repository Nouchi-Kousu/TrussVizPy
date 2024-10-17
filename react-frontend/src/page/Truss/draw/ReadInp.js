import React, { useContext, useEffect, useState } from 'react'
import { pointsContext, linesContext, loadsContext, lineMakingsContext } from './context'

// 前面定义的转换函数
function frontendInputDataToTxt(data) {
    let result = ''

    data.points.forEach(point => {
        result += `P,${point.x},${point.y},${point.Constraint_Type},${point.theta}\n`
    })

    data.makings.forEach(making => {
        const name = making.name || ''
        const color = making.color || ''
        result += `M,${name},${making.E},${making.A},${making.rho},${color}\n`
    })

    data.lines.forEach(line => {
        result += `L,${line.points[0]},${line.points[1]},${line.makingsIdx}\n`
    })

    data.loads.forEach(load => {
        result += `F,${load.point},${load.Fx},${load.Fy}\n`
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
        } else if (tokens[0] === 'F') {
            data.loads.push({
                point: parseInt(tokens[1], 10),
                Fx: parseFloat(tokens[2]),
                Fy: parseFloat(tokens[3])
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
    const [, setIsReadInp] = isReadInpSet
    const [name, setName] = useState('')
    const [note, setNote] = useState('')

    // 处理文件上传
    const onFileUpload = (event) => {
        handleFileUpload(event, setFrontendData)
    }

    useEffect(() => {
        if (frontendData) {
            setPoints([...frontendData.points])
            setLines([...frontendData.lines])
            setMakings([...frontendData.makings])
            setLoads([...frontendData.loads])
        }
    }, [frontendData])

    // 下载当前 frontendData 为 .txt 文件
    const downloadTxtFile = () => {
        setFrontendData({
            points: [...points],
            lines: [...lines],
            loads: [...loads],
            makings: [...makings]
        })
        const txt = frontendInputDataToTxt(frontendData)
        const blob = new Blob([txt], { type: 'text/plaincharset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'data.inp'
        a.click()
        URL.revokeObjectURL(url)
    }

    const save = () => {
        if (name === '') return
        const newData = {
            name,
            time: new Date().toISOString().slice(0, 10),
            note,
            data: {
                points: [...points],
                lines: [...lines],
                loads: [...loads],
                makings: [...makings]
            }
        }
        let data = localStorage.getItem('data')
        data = data ? JSON.parse(data) : []
        if (data.some(item => item.name === name)) {
            data = data.map(item => item.name !== name ? item : newData)
        } else {
            data = [...data, newData]
        }
        localStorage.setItem('data', JSON.stringify(data))
    }

    const dataList = JSON.parse(localStorage.getItem('data') ? localStorage.getItem('data') : [])

    return (
        <div className="modal-overlay" onClick={() => setIsReadInp(false)}>
            <div className="set" onClick={(e) => e.stopPropagation()} >
                <h2>存取数据</h2>
                <input type="file" accept=".txt,.inp" onChange={onFileUpload} />
                <button onClick={downloadTxtFile}>储存为 .inp 文件</button>
                <h4>浏览器本地存储</h4>
                结构名称：<input type="text" placeholder="name" onChange={e => setName(e.target.value)} />&nbsp;
                时间：<input type="datetime" placeholder="time" disabled value={new Date().toISOString().slice(0, 10)} />&nbsp;
                备注：<input type="text" placeholder="note" onChange={e => setNote(e.target.value)} />&nbsp;
                <span onClick={save}>存储</span>
            </div>

        </div >
    )
}

export default ReadInp
