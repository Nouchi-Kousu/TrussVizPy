import math
from time import time
import scipy
import scipy.linalg
from TrussPy import prepare_input, Point, Line, Load, Input_Data, Bidirectional_Map, Frontend_Line, Frontend_Input_Data, Visualization_Data
from rich import print
import TrussPy as tp
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.collections import LineCollection
from matplotlib.colors import Normalize


truss: Frontend_Input_Data = {
    'points': [
        Point(0, 0, 2),
        Point(1, 0, 2),
        Point(0.5, math.sqrt(3)/6),
        Point(0.5, math.sqrt(3)/2)
    ],
    'lines': [
        Frontend_Line((0, 3), 0),
        Frontend_Line((2, 3), 0),
        Frontend_Line((1, 3), 0),
        Frontend_Line((0, 2), 0),
        Frontend_Line((2, 1), 0),
        Frontend_Line((0, 1), 0)
    ],
    'loads': [
        Load(3, 90.710, -70.710),
    ],
    'makings': [
        {'E': 48e5, 'A': 1, 'rho': 0}
    ]
}

# truss: Frontend_Input_Data = {
#     'points': [
#         Point(0, 0, 2),
#         Point(2, 0, 2),
#         Point(2, 2),
#         Point(0, 2)
#     ],
#     'lines': [
#         Frontend_Line((0, 3), 0),
#         Frontend_Line((2, 3), 0),
#         Frontend_Line((1, 2), 0),
#         Frontend_Line((1, 3), 0),
#         Frontend_Line((0, 2), 0)
#     ],
#     'loads': [
#         Load(3, 10, 0),
#         Load(2, 10, 0)
#     ],
#     'makings': [
#         {'E': 48e5, 'A': 1, 'rho': 0}
#     ]
# }

time_start = time()
input_data = tp.prepare_frontend_input(truss)
# for line in input_data['line']:
#     print(np.rad2deg(line['theta']))
# point_map = Bidirectional_Map()
# gem, gl = tp.get_global_stiffness_matrix_and_gravity_load(input_data, point_map)
# load = tp.get_load_matrix(input_data, gl, point_map)
# result = scipy.linalg.solve(gem, load)
result = tp.main(input_data)

print(result)
print((time() - time_start)*1000)


def plot_truss_structure(data: Visualization_Data, disp_scale: int):
    points = data['points']
    lines = data['lines']

    # 提取点的坐标
    coords = [(p['x'] + p['dx'] * disp_scale, p['y'] + p['dy'] * disp_scale) for p in points]
    print(coords)
    # 提取杆件的两端点坐标以及相应的 sigma 值
    line_segments = [(coords[line['points'][0]],
                      coords[line['points'][1]]) for line in lines]
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
    cbar.set_label('Sigma')

    # 显示图形
    plt.show()


plot_truss_structure(result, 1000)
