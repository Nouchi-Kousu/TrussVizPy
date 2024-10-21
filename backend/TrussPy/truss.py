from math import pi
from typing import List
import numpy as np

from TrussPy.data import Bidirectional_Map
from TrussPy.data_types import Computational_Data, Point, point_output


def Get_Element_Stiffness_Matrix(k: float, theta: float) -> np.ndarray:
    '''计算平面桁架杆件单元刚度矩阵

    输入参数：
    k: 刚度系数
    theta: 杆件方向与X轴夹角

    返回值：
    K_matrix: 杆件单元刚度矩阵
    '''
    sin = np.sin(theta)
    cos = np.cos(theta)
    csk = sin * cos * k
    esm = np.array([
        [k * cos ** 2, csk],
        [csk, k * sin ** 2]
    ])
    return esm


def lult_decomposition(A):
    """
    LULT 分解函数，将对称正定矩阵 A 分解为 L 和 L^T，满足 A = L L^T
    :param A: 对称正定矩阵 (n x n)
    :return: L (下三角矩阵)
    """
    n = A.shape[0]
    L = np.zeros_like(A)

    for i in range(n):
        for j in range(i + 1):
            if i == j:
                # 对角线元素
                L[i, i] = np.sqrt(A[i, i] - np.sum(L[i, :i] ** 2))
            else:
                # 非对角线元素
                L[i, j] = (A[i, j] - np.sum(L[i, :j] * L[j, :j])) / L[j, j]

    return L


def forward_substitution(L, b):
    """
    前代法解 Ly = b
    :param L: 下三角矩阵
    :param b: 右端向量
    :return: 解 y
    """
    n = len(b)
    y = np.zeros_like(b, dtype=np.double)
    for i in range(n):
        y[i] = (b[i] - np.dot(L[i, :i], y[:i])) / L[i, i]
    return y


def backward_substitution(LT, y):
    """
    回代法解 L^T x = y
    :param LT: 上三角矩阵 (L 的转置)
    :param y: 右端向量
    :return: 解 x
    """
    n = len(y)
    x = np.zeros_like(y, dtype=np.double)
    for i in range(n - 1, -1, -1):
        x[i] = (y[i] - np.dot(LT[i, i + 1:], x[i + 1:])) / LT[i, i]
    return x


def solve_lult(A, b):
    """
    用 LULT 分解法解线性方程组 Ax = b
    :param A: 对称正定矩阵 (n x n)
    :param b: 右端向量
    :return: 解 x
    """
    L = lult_decomposition(A)
    y = forward_substitution(L, b)
    x = backward_substitution(L.T, y)
    return x


def get_global_stiffness_matrix_and_gravity_load(input_data: Computational_Data, point_map, g: float = 9.8):
    idx_num = len(input_data['points']) - input_data['constraint_nums']
    global_stiffness_matrix = np.zeros((idx_num*2, idx_num*2))
    # point_map = Bidirectional_Map()
    load_matrix = np.zeros((idx_num*2, 1))
    # 循环杆件构建总体刚度矩阵
    for line in input_data['lines']:
        for point_idx in line['points']:

            if input_data['points'][point_idx]['Constraint_Type'] == 0:
                gsm_idx = point_map.get_idx(point_idx) * 2
                esm = Get_Element_Stiffness_Matrix(line['k'], line['theta'])
                global_stiffness_matrix[gsm_idx:gsm_idx +
                                        2, gsm_idx:gsm_idx+2] += esm
                load_matrix[gsm_idx+1] -= line['m'] * g

            elif input_data['points'][point_idx]['Constraint_Type'] == 1:
                esm = Get_Element_Stiffness_Matrix(
                    9e100, input_data['points'][point_idx]['theta'] + pi / 2)
                gsm_idx = point_map.get_idx(point_idx) * 2
                global_stiffness_matrix[gsm_idx:gsm_idx +
                                        2, gsm_idx:gsm_idx+2] += esm

        # 处理非对角元
        if input_data['points'][line['points'][0]]['Constraint_Type'] != 2 and input_data['points'][line['points'][1]]['Constraint_Type'] != 2:
            i = point_map.get_idx(line['points'][0])
            j = point_map.get_idx(line['points'][1])
            esm = Get_Element_Stiffness_Matrix(line['k'], line['theta'])
            global_stiffness_matrix[i*2:i*2+2, j*2:j*2+2] -= esm
            global_stiffness_matrix[j*2:j*2+2, i*2:i*2+2] -= esm

    return global_stiffness_matrix, load_matrix


def get_load_matrix(input_data: Computational_Data, gravity_load, point_map):
    idx_num = len(input_data['points']) - input_data['constraint_nums']
    load_matrix = np.zeros((idx_num*2, 1))
    for load in input_data['loads']:
        idx = point_map.get_idx(load['point'])
        load_matrix[idx*2] += load['Fx']
        load_matrix[idx*2+1] += load['Fy']

    return load_matrix + gravity_load


def get_output_points(input_points: List[Point], point_displacement, point_map: Bidirectional_Map):

    def get_output_point(idx, point):
        if point_map.has_point(idx):
            i = point_map.get_idx(idx)
            output_points = point_output(point, point_displacement[i*2, :][0],
                                         point_displacement[i*2+1][0])
        else:
            output_points = point_output(point)

        return output_points

    output_points = [get_output_point(idx, point)
                     for idx, point in enumerate(input_points)]

    return output_points

