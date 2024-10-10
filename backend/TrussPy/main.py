from math import inf, pi
from typing import List
from .data import Calculation_Result_to_Visualization, Bidirectional_Map
from .data_types import Calculation_Result_Data, Frontend_Input_Data, Point, point_output
import numpy as np
from .truss import Get_Element_Stiffness_Matrix, LULT_Decomposition_Solver


def get_global_stiffness_matrix_and_gravity_load(input_data: Frontend_Input_Data, point_map, g: float = 9.8):
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
                global_stiffness_matrix[gsm_idx:gsm_idx + 2, gsm_idx:gsm_idx+2] += esm
                load_matrix[gsm_idx+1] += line['m'] * g

            elif input_data['points'][point_idx]['Constraint_Type'] == 1:
                esm = Get_Element_Stiffness_Matrix(
                    9e100, input_data['points'][point_idx]['theta'] + pi / 2)
                gsm_idx = point_map.get_idx(point_idx) * 2
                global_stiffness_matrix[gsm_idx:gsm_idx + 2, gsm_idx:gsm_idx+2] += esm

        # 处理非对角元
        if input_data['points'][line['points'][0]]['Constraint_Type'] != 2 and input_data['points'][line['points'][1]]['Constraint_Type'] != 2:
            i = point_map.get_idx(line['points'][0])
            j = point_map.get_idx(line['points'][1])
            esm = Get_Element_Stiffness_Matrix(line['k'], line['theta'])
            global_stiffness_matrix[i*2:i*2+2, j*2:j*2+2] -= esm
            global_stiffness_matrix[j*2:j*2+2, i*2:i*2+2] -= esm

    return global_stiffness_matrix, load_matrix


def get_load_matrix(input_data: Frontend_Input_Data, gravity_load, point_map):
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


def main(input_data: Frontend_Input_Data):
    point_map = Bidirectional_Map()
    global_stiffness_matrix, gravity_load = get_global_stiffness_matrix_and_gravity_load(
        input_data, point_map)
    load_matrix = get_load_matrix(input_data, gravity_load, point_map)
    point_displacement = LULT_Decomposition_Solver(
        global_stiffness_matrix, load_matrix)
    output_points = get_output_points(
        input_data['points'], point_displacement, point_map)
    calculation_result_data = Calculation_Result_Data(
        points=output_points, lines=input_data['lines'], loads=input_data['loads'])
    return Calculation_Result_to_Visualization(calculation_result_data)
