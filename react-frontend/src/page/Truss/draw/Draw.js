import Right from "./Right";
import Left from "./Left";
import SetLineMakings from "./SetLineMakings";
import { penTypeContext, makingsContext } from './context'
import { useState } from "react";

const Draw = () => {
    const [penType, setPenType] = useState("choose");
    const [makingsSeting, setMakingsSetting] = useState(false);
    const [lineMakings, setLineMakings] = useState([{}]); // 储存材料
    const [lineMakingsIdx, setLineMakingIdx] = useState(-1);

    return (
        <div className="draw">
            <makingsContext.Provider value={[makingsSeting, setMakingsSetting]}>
                <penTypeContext.Provider value={[penType, setPenType]}>
                    <Left />
                    <Right lineMakingsSet={[lineMakings, setLineMakings]} lineMakingsIdxSet={[lineMakingsIdx, setLineMakingIdx]} />
                    {makingsSeting && <SetLineMakings lineMkingsSet={[lineMakings, setLineMakings]} />}
                </penTypeContext.Provider>
            </makingsContext.Provider>
        </div>
    );
};

export default Draw;
