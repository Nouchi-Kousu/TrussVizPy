from typing import List, TypedDict


# 点坐标数据结构
class Point(TypedDict):
    x: float
    y: float
    is_Constraint: bool

# 杆件数据结构
class Line(TypedDict):
    start: int
    end: int
    E: float
    A: float
    L: float
    k: float

# 应力杆件数据结构
class Line_Force(TypedDict):
    start: int
    end: int
    sigma: float

# 载荷数据结构
class Load(TypedDict):
    point: int
    Fx: float
    Fy: float

# 前端通过GET方法传递的桁架结构相关的输入数据
class Frontend_Input(TypedDict):
    point: List[Point]
    line: List[Line]
    load: List[Load]

# 后端进行桁架结构计算后生成的结果数据
class Calculation_Result(TypedDict):
    point: List[Point]
    line: List[Line]
    load: List[Load]

# 后端将计算结果处理后返回给前端，用于可视化展示的结果数据
class Visualization(TypedDict):
    point: List[Point]
    line: List[Line_Force]