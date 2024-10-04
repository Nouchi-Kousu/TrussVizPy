import Right from "./Right";
import Left from "./Left";
import SetLineMakings from "./SetLineMakings";
import { penTypeContext, makingsContext } from './context'
import { useState } from "react";

const Draw = () => {
    const [penType, setPenType] = useState("choose");
    const [makingsSeting, setMakingsSetting] = useState(false);

    return (
        <div className="draw">
            <makingsContext.Provider value={[makingsSeting, setMakingsSetting]}>
            <penTypeContext.Provider value={[penType, setPenType]}>
                <Left />
                <Right />
                {makingsSeting && <SetLineMakings />}
            </penTypeContext.Provider>
            </makingsContext.Provider>
        </div>
    );
};

export default Draw;
