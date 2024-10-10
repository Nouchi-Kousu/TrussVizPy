import math
from time import time
import scipy
import scipy.linalg
from TrussPy import prepare_input, Point, Line, Load, Input_Data, Bidirectional_Map
# from rich import print
import TrussPy as tp


truss: Input_Data = {
    'points': [
        Point(0, 0, 2),
        Point(1, 0, 2),
        Point(0.5, math.sqrt(3)/6),
        Point(0.5, math.sqrt(3)/2)
    ],
    'lines': [
        Line((0, 3), 48e5, 1),
        Line((2, 3), 48e5, 1),
        Line((1, 3), 48e5, 1),
        Line((0, 2), 48e5, 1),
        Line((2, 1), 48e5, 1),
        Line((0, 1), 48e5, 1)
    ],
    'loads': [
        Load(3, 90.710, -70.710),
    ],
    'constraint_nums': 2
}

# truss: Input_Data = {
#     'point': [
#         Point(0, 0, 2),
#         Point(2, 0, 2),
#         Point(2, 2),
#         Point(0, 2)
#     ],
#     'line': [
#         Line((0, 3), 48e5, 1),
#         Line((2, 3), 48e5, 1),
#         Line((1, 2), 48e5, 1),
#         Line((1, 3), 48e5, 1),
#         Line((0, 2), 48e5, 1)
#     ],
#     'load': [
#         Load(3, 10, 0),
#         Load(2, 10, 0)
#     ],
#     'constraint_nums': 2
# }
time_start = time()
input_data = prepare_input(truss)
# for line in input_data['line']:
#     print(np.rad2deg(line['theta']))
# point_map = Bidirectional_Map()
# gem, gl = tp.get_global_stiffness_matrix_and_gravity_load(input_data, point_map)
# load = tp.get_load_matrix(input_data, gl, point_map)
# result = scipy.linalg.solve(gem, load)
result = tp.main(input_data)

# print(result)
print((time() - time_start)*1000)
