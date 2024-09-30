import Right from "./Right";
import Left from "./Left";
import { penTypeContext } from './context'
import { useState } from "react";

const Draw = () => {
    const [penType, setPenType] = useState("choose");

    return (
        <div className="draw">
            <penTypeContext.Provider value={[penType, setPenType]}>
                <Left />
                <Right />
            </penTypeContext.Provider>
        </div>
    );
};

export default Draw;
