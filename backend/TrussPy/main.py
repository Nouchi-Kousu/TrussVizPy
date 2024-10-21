from math import inf, pi
from typing import List
import scipy
import scipy.linalg
from .data import Bidirectional_Map
from .data_types import Calculation_Result_Data, Computational_Data, Frontend_Input_Data, Point, point_output
import numpy as np
from .truss import get_global_stiffness_matrix_and_gravity_load
from .truss import get_load_matrix
from .truss import get_output_points
from .data import Calculation_Result_to_Visualization


def main(input_data: Computational_Data):

    # 建立节点索引和总刚索引的双向映射表
    point_map = Bidirectional_Map()
    # 循环杆件构建总体刚度阵和重力载荷阵
    global_stiffness_matrix, gravity_load = get_global_stiffness_matrix_and_gravity_load(
        input_data, point_map)
    # 构建总体载荷阵
    load_matrix = get_load_matrix(input_data, gravity_load, point_map)
    # 求解方程组
    point_displacement = scipy.linalg.solve(
        global_stiffness_matrix, load_matrix)
    # 合并节点位移
    output_points = get_output_points(
        input_data['points'], point_displacement, point_map)
    calculation_result_data = Calculation_Result_Data(points=output_points,
                                                      lines=input_data['lines'], loads=input_data['loads'])
    # 返回计算杆力后的数据
    return Calculation_Result_to_Visualization(calculation_result_data)
