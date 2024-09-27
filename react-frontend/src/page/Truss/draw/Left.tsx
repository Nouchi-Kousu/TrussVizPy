const Left = () => {
    const button = [
        "logo",
        "choose",
        "move",
        "delete",
        "point",
        "line",
        "constraint2",
        "constraint1",
        "load"
    ];
    const buttons = button.map((item, idx) => (
        <li className={item} key={item}>
            {idx}
        </li>
    ));
    return (
        <div className="left">
            <ul className="leftButton">{buttons}</ul>
        </div>
    );
};

export default Left;
