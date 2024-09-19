from .data import Calculation_Result_to_Visualization, Bidirectional_Map
from .data_types import Calculation_Result_Data, Frontend_Input_Data
import numpy as np
from .truss import Get_Element_Stiffness_Matrix

def main(imput_data: Frontend_Input_Data):
        idx_num = len(imput_data['point']) - imput_data['constraint_nums']
        global_stiffness_matrix = np.zeros((idx_num*2, idx_num*2))
        point_map = Bidirectional_Map()

        # 循环杆件构建总体刚度矩阵
        for line in imput_data['line']:
            for point_idx in line['points']:

                # 根据节点类型分别构建
                if imput_data['point'][point_idx]['Constraint_Type'] == 0:
                    gsm_idx = point_map.get_idx(point_idx) * 2
                    esm = Get_Element_Stiffness_Matrix(line['k'], line['theta'])
                    global_stiffness_matrix[gsm_idx:gsm_idx+2, gsm_idx:gsm_idx+2] += esm

                elif imput_data['point'][point_idx]['Constraint_Type'] == 1:
                    # TODO 滑动铰支座
                    ...

        load_matrix = np.zeros((idx_num*2,1))
        # 循环荷载构建载荷矩阵
        for load in imput_data['load']:
            idx = point_map.get_idx(load['point'])
            load_matrix[idx*2] += load['Fx']
            load_matrix[idx*2+1] += load['Fy']
