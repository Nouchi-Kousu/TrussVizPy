import numpy as np


def Get_Element_Stiffness_Matrix(k:float, theta: float):
    return np.array([
        [k * np.cos(theta) ** 2, k * np.cos(theta) * np.sin(theta)],
        [k * np.cos(theta) * np.sin(theta), k * np.sin(theta) ** 2]
    ])