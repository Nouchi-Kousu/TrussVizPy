import Right from "./Right";
import Left from "./Left";
import SetLineMakings from "./SetLineMakings";
import { penTypeContext, makingsContext, linesContext, lineMakingsIdxContext, lineMakingsContext } from './context'
import { useState } from "react";

const Draw = () => {
    const [penType, setPenType] = useState("choose");
    const [makingsSeting, setMakingsSetting] = useState(false);
    const [lineMakings, setLineMakings] = useState([{ name: 'Normal', E: 4.8e6, A: 1, rho: 0, color: '#66ccff' }]); // 储存材料
    const [lineMakingsIdx, setLineMakingsIdx] = useState(0);
    const [lines, setLines] = useState([]); // 储存杆件

    return (
        <div className="draw">
            <lineMakingsContext.Provider value={[lineMakings, setLineMakings]}>
            <lineMakingsIdxContext.Provider value={[lineMakingsIdx, setLineMakingsIdx]}>
            <linesContext.Provider value={[lines, setLines]}>
            <makingsContext.Provider value={[makingsSeting, setMakingsSetting]}>
            <penTypeContext.Provider value={[penType, setPenType]}>
                <Left />
                <Right />
                {makingsSeting && <SetLineMakings />}
            </penTypeContext.Provider>
            </makingsContext.Provider>
            </linesContext.Provider>
            </lineMakingsIdxContext.Provider>
            </lineMakingsContext.Provider>
        </div>
    );
};

export default Draw;
