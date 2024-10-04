import { useContext } from "react";
import { makingsContext } from "./context";

const SetLineMakings = () => {
    const [, setMakingsSetting] = useContext(makingsContext);
    const closeModal = () => {
        setMakingsSetting(false);
    };
    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="makings" onClick={(e) => e.stopPropagation()}>
                <h2>设置杆件材料</h2>
                材料名：<input type="text" placeholder="name" />&nbsp;
                E：<input type="number" placeholder="modulus" />&nbsp;
                A：<input type="number" placeholder="area" />&nbsp;
                ρ：<input type="number" placeholder="densities" />&nbsp;&nbsp;&nbsp;
                <span onClick={}>添加</span>
            </div>
        </div>
    )
}

export default SetLineMakings;