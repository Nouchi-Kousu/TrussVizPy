import { useContext, useState } from "react";
import { makingsContext } from "./context";

const SetLineMakings = ({ lineMkingsSet, lineMkingsIdxSet }) => {
    const [, setMakingsSetting] = useContext(makingsContext);
    const [lineMakings, setLineMakings] = lineMkingsSet;

    const closeModal = () => {
        setMakingsSetting(false);
    };
    const [newMakings, setNewMakings] = useState({name: ""})
    const addMakings = (e, type) => {
        setNewMakings(prev => ({ ...prev, [type]: e.target.value }))
    }
    const markingsList = lineMakings.map((item) => {
        return (
            <div key={item.name}>
                材料名：<span className="list">{item.name}</span>&nbsp;
                E：<span className="list">{item.E}</span>&nbsp;
                A：<span className="list">{item.A}</span>&nbsp;
                ρ：<span className="list">{item.rho}</span>&nbsp;&nbsp;&nbsp;
                <span className="button" onClick={() => {
                    setLineMakings([...lineMakings.filter(it => it.name !== item.name)])
                }}>删除</span>
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
                    ρ：<input type="number" placeholder="densities" onChange={(e) => addMakings(e, 'rho')} />&nbsp;&nbsp;&nbsp;
                    <span className="button" onClick={() => {
                        if (newMakings.name === '') return
                        setLineMakings([...lineMakings.filter(item => item.name !== newMakings.name), newMakings])
                    }}>添加</span>
                </div>
                <div className="divlist">{markingsList}</div>
            </div>
        </div >
    )
}

export default SetLineMakings;