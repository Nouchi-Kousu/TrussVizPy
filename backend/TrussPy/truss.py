import numpy as np
import scipy
import scipy.linalg


def Get_Element_Stiffness_Matrix(k: float, theta: float) -> np.ndarray:
    '''计算平面桁架杆件单元刚度矩阵

    输入参数：
    k: 刚度系数
    theta: 杆件方向与X轴夹角

    返回值：
    K_matrix: 杆件单元刚度矩阵
    '''
    esm = np.array([
        [k * np.cos(theta) ** 2, k * np.cos(theta) * np.sin(theta)],
        [k * np.cos(theta) * np.sin(theta), k * np.sin(theta) ** 2]
    ])
    return esm


def LULT_Decomposition_Solver(gsm: np.ndarray, b: np.ndarray) -> np.ndarray:
    # TODO 待实现
    return scipy.linalg.solve(gsm, b)
