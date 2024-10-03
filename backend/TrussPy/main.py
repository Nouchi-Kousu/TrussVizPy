from .data import Calculation_Result_to_Visualization, Bidirectional_Map
from .data_types import Frontend_Input_Data
import numpy as np
from .truss import Get_Element_Stiffness_Matrix, LULT_Decomposition_Solver


def main(input_data: Frontend_Input_Data):
    idx_num = len(input_data['point']) - input_data['constraint_nums']
    global_stiffness_matrix = np.zeros((idx_num*2, idx_num*2))
    point_map = Bidirectional_Map()
    load_matrix = np.zeros((idx_num*2, 1))

    # 循环杆件构建总体刚度矩阵
    for line in input_data['line']:
        for point_idx in line['points']:

            if input_data['point'][point_idx]['Constraint_Type'] == 0:
                gsm_idx = point_map.get_idx(point_idx) * 2
                esm = Get_Element_Stiffness_Matrix(line['k'], line['theta'])
                global_stiffness_matrix[gsm_idx:gsm_idx+2, gsm_idx:gsm_idx+2] += esm
                load_matrix[gsm_idx+1] += line['m'] * 9.8

            elif input_data['point'][point_idx]['Constraint_Type'] == 1:
                # TODO 滑动铰支座
                ...

        # 处理非对角元
        if input_data['point'][line['points'][0]]['Constraint_Type'] != 2 and input_data['point'][line['points'][1]]['Constraint_Type'] != 2:
            i = point_map.get_idx(line['points'][0])
            j = point_map.get_idx(line['points'][1])
            esm = Get_Element_Stiffness_Matrix(line['k'], line['theta'])
            global_stiffness_matrix[i*2:i*2+2, j*2:j*2+2] -= esm
            global_stiffness_matrix[j*2:j*2+2, i*2:i*2+2] -= esm

    # 循环荷载构建载荷矩阵
    for load in input_data['load']:
        idx = point_map.get_idx(load['point'])
        load_matrix[idx*2] += load['Fx']
        load_matrix[idx*2+1] += load['Fy']

    point_displacement = LULT_Decomposition_Solver(
        global_stiffness_matrix, load_matrix)

    for i in range(idx_num):
        point_num = point_map.get_point(i)
        input_data['point'][point_num]['x'] += float(point_displacement[i*2][0])
        input_data['point'][point_num]['y'] += float(point_displacement[i*2+1][0])

    return Calculation_Result_to_Visualization(input_data), point_displacement
