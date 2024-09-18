from data import Calculation_Result_to_Visualization
from types import Calculation_Result_Data

test_data: Calculation_Result_Data = {
    'point': [
        {'x': 0, 'y': 0, 'is_Constraint': False},
        {'x': 1, 'y': 1, 'is_Constraint': False},
    ],
    'line': [
        {'start': 0, 'end': 1, 'L': 1, 'E': 1, 'k': 1, 'A': 1},
    ],
    'load': [
        {'point': 0, 'Fx': 1, 'Fy': 1},
    ]
}

result = Calculation_Result_to_Visualization(test_data)

print(result)