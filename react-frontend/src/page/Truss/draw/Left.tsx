import { useContext } from "react";
import {penTypeConText} from './context'

const Left = () => {
    const button = [
        "choose",
        "move",
        "grab",
        "delete",
        "point",
        "line",
        "constraint2",
        "constraint1",
        "load",
    ];
    const [, setPenType] = useContext(penTypeConText)
    const buttons = button.map((item, idx) => (
        <li className={item} key={item} onClick={() => setPenType(item)}>
            {idx}
        </li>
    ));
    return (
        <div className="left">
            <ul className="leftButton">
                <li className="logo"></li>
                {buttons}
            </ul>
        </div>
    );
};

export default Left;
