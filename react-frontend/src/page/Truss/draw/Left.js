import { useContext } from "react";
import { penTypeContext } from './context'

const Left = () => {
    const button = [
        "choose",
        "grab",
        "delete",
        "point",
        "line",
        "constraint2",
        "constraint1",
        "load",
    ];
    const [, setPenType] = useContext(penTypeContext)

    const buttons = button.map((item, idx) => (
        <li className={item} key={item} onClick={() => setPenType(item)}>
            {item}
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
