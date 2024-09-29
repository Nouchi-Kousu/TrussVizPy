import Right from "./Right";
import Left from "./Left";
import {penTypeConText} from './context'
import { createContext, useState } from "react";

const Draw = () => {
    const [penType, setPenType] = useState("choose");

    return (
        <div className="draw">
            <penTypeConText.Provider value={[penType, setPenType]}>
                <Left />
                <Right />
            </penTypeConText.Provider>
        </div>
    );
};

export default Draw;
