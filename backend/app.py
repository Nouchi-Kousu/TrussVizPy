import math
from TrussPy import TrussPy, prepare_input, Point, Line, Load, Input_Data
from rich import print

# truss:Input_Data = {
#     'point': [
#         Point(0, 0, 2),
#         Point(1, 0, 2),
#         Point(0.5, math.sqrt(3)/6),
#         Point(0.5, math.sqrt(3)/2)
#     ],
#     'line': [
#         Line((0, 3), 48e5, 1),
#         Line((2, 3), 48e5, 1),
#         Line((1, 3), 48e5, 1),
#         Line((0, 2), 48e5, 1),
#         Line((1, 2), 48e5, 1),
#         Line((0, 1), 48e5, 1)
#     ],
#     'load': [
#         Load(3, 90.710, -70.710),
#     ],
#     'constraint_nums': 2
# }

truss: Input_Data = {
    'point': [
        Point(0, 0, 2),
        Point(2, 0, 2),
        Point(2, 2),
        Point(0, 2)
    ],
    'line': [
        Line((0, 3), 48e5, 1),
        Line((2, 3), 48e5, 1),
        Line((1, 2), 48e5, 1),
        Line((1, 3), 48e5, 1),
        Line((0, 2), 48e5, 1)
    ],
    'load': [
        Load(3, 10, 0),
        Load(2, 10, 0)
    ],
    'constraint_nums': 2
}

input_data = prepare_input(truss)
result = TrussPy(input_data)

print(result)
