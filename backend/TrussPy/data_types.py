from typing import List, Literal, NotRequired, Tuple, TypedDict


# 点坐标数据结构
class Point(TypedDict):
    x: float
    y: float
    # 约束类型，0为无约束，1为滑动铰支座，2为固定铰支座
    Constraint_Type: Literal[0, 1, 2]
    theta: NotRequired[float]

# 杆件数据结构
class Line(TypedDict):
    points: Tuple[int, int]
    L: float
    k: float
    theta: float

# 应力杆件数据结构
class Line_Force(TypedDict):
    points: Tuple[int, int]
    sigma: float

# 载荷数据结构
class Load(TypedDict):
    point: int
    Fx: float
    Fy: float

# 前端通过GET方法传递的桁架结构相关的输入数据
class Frontend_Input_Data(TypedDict):
    point: List[Point]
    line: List[Line]
    load: List[Load]
    constraint_nums: int

# 后端进行桁架结构计算后生成的结果数据
class Calculation_Result_Data(TypedDict):
    point: List[Point]
    line: List[Line]
    load: List[Load]

# 后端将计算结果处理后返回给前端，用于可视化展示的结果数据
class Visualization_Data(TypedDict):
    point: List[Point]
    line: List[Line_Force]