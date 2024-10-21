from json import loads
from matplotlib.collections import LineCollection
from matplotlib.colors import Normalize
import matplotlib.cm as cm
import matplotlib.pyplot as plt
import numpy as np
from ..data_types import Visualization_Data, Computational_Data


def plot_truss_structure(data: Visualization_Data, disp_scale: int = 100, load_scale: int = 100):
    points = data['points']
    lines = data['lines']

    # 提取点的坐标
    coords = [(p['x'] + p['dx'] * disp_scale, p['y'] +
               p['dy'] * disp_scale) for p in points]
    print(coords)
    # 提取杆件的两端点坐标以及相应的 sigma 值
    line_segments = [(coords[line['points'][0]],
                      coords[line['points'][1]]) for line in lines]
    sigma_values = np.array([line['sigma'] for line in lines])

    # 根据 sigma 值分配颜色，使用 colormap 进行着色
    cmap = cm.get_cmap('coolwarm')
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

    for load in data['loads']:
        point = points[load['point']]
        ax.arrow(point['x'] + point['dx'] * disp_scale, point['y'] + point['dy']
                 * disp_scale, load['Fx'] /
                 load_scale, load['Fy'] / load_scale,
                 head_width=0.05)

    # 设置坐标轴的比例和范围
    ax.autoscale()
    ax.margins(0.1)
    ax.set_aspect('equal')

    # 添加颜色条，设置fraction和pad以调整大小和位置
    sm = cm.ScalarMappable(cmap=cmap, norm=norm)
    sm.set_array(sigma_values)
    cbar = plt.colorbar(sm, ax=ax, fraction=0.03, pad=0.02)  # 调整fraction和pad
    cbar.set_label('Sigma')


def plot_truss(data: Computational_Data, load_scale: int = 100):
    points = data['points']
    lines = data['lines']

    # 提取点的坐标
    coords = [(p['x'], p['y']) for p in points]
    print(coords)
    # 提取杆件的两端点坐标以及相应的 sigma 值
    line_segments = [(coords[line['points'][0]],
                      coords[line['points'][1]]) for line in lines]

    # 创建 LineCollection 来绘制多条线段
    lc = LineCollection(line_segments, linewidths=2)

    # 创建图形
    fig, ax = plt.subplots()
    ax.add_collection(lc)

    # 绘制点
    x_vals, y_vals = zip(*coords)
    ax.scatter(x_vals, y_vals, c='black')

    for load in data['loads']:
        point = points[load['point']]
        ax.arrow(point['x'], point['y'], load['Fx'] /
                 load_scale, load['Fy'] / load_scale,
                 head_width=0.05)

    # 设置坐标轴的比例和范围
    ax.autoscale()
    ax.margins(0.1)
    ax.set_aspect('equal')
