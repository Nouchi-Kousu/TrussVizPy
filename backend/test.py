import matplotlib.pyplot as plt
import numpy as np
from typing import List, Tuple, Literal, TypedDict
from matplotlib.collections import LineCollection
from matplotlib.colors import Normalize

# 你的数据结构定义
class Point_Output(TypedDict):
    x: float
    y: float
    dx: float
    dy: float
    Constraint_Type: Literal[0, 1, 2]
    theta: float

class Line_Force(TypedDict):
    points: Tuple[int, int]
    sigma: float

class Visualization_Data(TypedDict):
    points: List[Point_Output]
    lines: List[Line_Force]

# 绘制函数
def plot_truss_structure(data: Visualization_Data):
    points = data['points']
    lines = data['lines']

    # 提取点的坐标
    coords = [(p['x'] + p['dx'], p['y'] + p['dy']) for p in points]

    # 提取杆件的两端点坐标以及相应的 sigma 值
    line_segments = [(coords[line['points'][0]], coords[line['points'][1]]) for line in lines]
    sigma_values = np.array([line['sigma'] for line in lines])

    # 根据 sigma 值分配颜色，使用 colormap 进行着色
    cmap = plt.get_cmap('coolwarm')
    norm = Normalize(vmin=np.min(sigma_values), vmax=np.max(sigma_values))
    colors = cmap(norm(sigma_values))

    # 创建 LineCollection 来绘制多条线段
    lc = LineCollection(line_segments, colors=colors, linewidths=2)

    # 创建图形
    fig, ax = plt.subplots()
    ax.add_collection(lc)

    # 绘制点
    x_vals, y_vals = zip(*coords)
    ax.scatter(x_vals, y_vals, c='black')

    # 设置坐标轴的比例和范围
    ax.autoscale()
    ax.margins(0.1)
    ax.set_aspect('equal')

    # 添加颜色条
    sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
    sm.set_array(sigma_values)
    cbar = plt.colorbar(sm, ax=ax)
    cbar.set_label('Sigma (应力)')

    # 显示图形
    plt.show()

# 示例数据
data:Visualization_Data = {
    'points': [
        {'x': 0, 'y': 0, 'dx': 1, 'dy': 0, 'Constraint_Type': 0, 'theta': 0},
        {'x': 1, 'y': 1, 'dx': 0, 'dy': 0, 'Constraint_Type': 0, 'theta': 0},
        {'x': 2, 'y': 0, 'dx': 0, 'dy': 0, 'Constraint_Type': 0, 'theta': 0},
    ],
    'lines': [
        {'points': (0, 1), 'sigma': 10},
        {'points': (1, 2), 'sigma': -5},
        {'points': (0, 2), 'sigma': 0},
    ]
}

# 调用绘制函数
plot_truss_structure(data)
