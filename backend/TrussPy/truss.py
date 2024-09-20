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
    sin = np.sin(theta)
    cos = np.cos(theta)
    csk = sin * cos * k
    esm = np.array([
        [k * cos ** 2, csk],
        [csk, k * sin ** 2]
    ])
    return esm


def LULT_Decomposition_Solver(gsm: np.ndarray, b: np.ndarray) -> np.ndarray:
    # TODO 待实现
    return scipy.linalg.solve(gsm, b)
