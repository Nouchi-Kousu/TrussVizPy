import numpy as np
from TrussPy import TrussPy, prepare_input, Point, Line, Load, Input_Data
from rich import print

truss:Input_Data = {
    'point': [
        Point(0, 0, 2),
        Point(1, 0, 2),
        Point(0.5, 0.2887),
        Point(0.5, 0.866)
    ],
    'line': [
        Line((0, 3), 48e5, 1),
        Line((2, 3), 48e5, 1),
        Line((1, 3), 48e5, 1),
        Line((0, 2), 48e5, 1),
        Line((1, 2), 48e5, 1),
        Line((0, 1), 48e5, 1)
    ],
    'load': [
        Load(3, 20, 0),
        Load(3, 120/np.sqrt(2), -120/np.sqrt(2))
    ],
    'constraint_nums': 2
}

input_data = prepare_input(truss)
result = TrussPy(input_data)

print(result)