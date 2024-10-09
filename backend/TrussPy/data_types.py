from typing import List, Literal, NotRequired, Tuple, TypedDict


class Point(TypedDict):
    # 点坐标数据结构
    x: float
    y: float
    # 约束类型，0为无约束，1为滑动铰支座，2为固定铰支座
    Constraint_Type: Literal[0, 1, 2]
    theta: float


class Point_Output(TypedDict):
    x: float
    y: float
    dx: float
    dy: float
    Constraint_Type: Literal[0, 1, 2]
    theta: float


class Line(TypedDict):
    # 杆件数据结构
    points: Tuple[int, int]
    L: float
    k: float
    E: float
    m: float
    theta: float


class Line_input(TypedDict):
    points: Tuple[int, int]
    E: float
    A: float
    rho: float


class Line_Force(TypedDict):
    # 应力杆件数据结构
    points: Tuple[int, int]
    sigma: float


class Load(TypedDict):
    # 载荷数据结构
    point: int
    Fx: float
    Fy: float


class Input_Data(TypedDict):
    point: List[Point]
    line: List[Line_input]
    load: List[Load]
    constraint_nums: int


class Frontend_Input_Data(TypedDict):
    # 前端通过GET方法传递的桁架结构相关的输入数据
    point: List[Point]
    line: List[Line]
    load: List[Load]
    constraint_nums: int


class Calculation_Result_Data(TypedDict):
    # 后端进行桁架结构计算后生成的结果数据
    point: List[Point_Output]
    line: List[Line]
    load: List[Load]
    constraint_nums: int


class Visualization_Data(TypedDict):
    # 后端将计算结果处理后返回给前端，用于可视化展示的结果数据
    point: List[Point_Output]
    line: List[Line_Force]


def point_init(x: float, y: float, Constraint_Type: Literal[0, 1, 2] = 0, theta: float = 0):
    return Point(x=x, y=y, Constraint_Type=Constraint_Type, theta=theta)


def line_init(points: Tuple[int, int], E: float, A: float, rho: float = 0):
    return Line_input(points=points, E=E, A=A, rho=rho)


def load_init(point: int, Fx: float, Fy: float):
    return Load(point=point, Fx=Fx, Fy=Fy)


def point_output(point: Point, dx: float = 0, dy: float = 0):
    return Point_Output(x=point['x'], y=point['y'], dx=dx, dy=dy, Constraint_Type=point['Constraint_Type'], theta=point['theta'])
