import { useContext, useState } from "react"
import { makingsContext, linesContext, lineMakingsIdxContext, lineMakingsContext } from "./context"

const SetLineMakings = () => {
    const [lines, setLines] = useContext(linesContext)
    const [, setMakingsSetting] = useContext(makingsContext)
    const [lineMakings, setLineMakings] = useContext(lineMakingsContext)
    const [lineMakingsIdx, setLineMakingsIdx] = useContext(lineMakingsIdxContext)

    const closeModal = () => {
        setMakingsSetting(false)
    }
    const [newMakings, setNewMakings] = useState({ name: "" })
    const addMakings = (e, type) => {
        if (type === 'rho' || type === 'E' || type === 'A') {
            setNewMakings(prev => ({ ...prev, [type]: Number(e.target.value) }))
        } else {
            setNewMakings(prev => ({ ...prev, [type]: e.target.value }))
        }
    }
    const markingsList = lineMakings.map((item, idx) => {
        return (
            <div key={item.name}>
                材料名：<span className="list">{item.name}</span>&nbsp;
                E：<span className="list">{item.E}</span>&nbsp;
                A：<span className="list">{item.A}</span>&nbsp;
                ρ：<span className="list">{item.rho}</span>&nbsp;&nbsp;
                <input type="color" className="color" disabled value={item.color}></input>&nbsp;&nbsp;
                {item.name !== 'Normal' && <span className="button" onClick={() => {
                    if (lineMakingsIdx === idx) setLineMakingsIdx(0)
                    setLineMakings(lineMakings.filter(it => it.name !== item.name))
                    setLines(lines.map(line => {
                        if (line.makings === idx) {
                            line.makings = 0
                        } else if (line.makings > idx) {
                            line.makings -= 1
                        }
                        return line
                    }))
                }}>删除</span>}
            </div>
        )
    })
    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="makings" onClick={(e) => e.stopPropagation()}>
                <h2>设置杆件材料</h2>
                <div>
                    材料名：<input type="text" placeholder="name" onChange={(e) => addMakings(e, 'name')} />&nbsp;
                    E：<input type="number" placeholder="modulus" onChange={(e) => addMakings(e, 'E')} />&nbsp;
                    A：<input type="number" placeholder="area" onChange={(e) => addMakings(e, 'A')} />&nbsp;
                    ρ：<input type="number" placeholder="densities" onChange={(e) => addMakings(e, 'rho')} />&nbsp;&nbsp;
                    <input type="color" className="color" onChange={(e) => addMakings(e, 'color')}></input>&nbsp;&nbsp;
                    <span className="button" onClick={() => {
                        if (newMakings.name === '') return
                        if (lineMakings.some(item => item.name === newMakings.name)) {
                            setLineMakings(lineMakings.map(item => item.name !== newMakings.name ? item : newMakings))
                        } else {
                            setLineMakings([...lineMakings, newMakings])
                        }
                    }}>添加</span>
                </div>
                <div className="divlist">{markingsList}</div>
            </div>
        </div >
    )
}

export default SetLineMakings