from data import Calculation_Result_to_Visualization
from data_types import Calculation_Result_Data

test_data = Calculation_Result_Data(
    point=[
        {'x': 0, 'y': 0, 'Constraint_Type': 0},
        {'x': 1, 'y': 1, 'Constraint_Type': 0},
    ],
    line=[
        {'start': 0, 'end': 1, 'L': 1, 'k': 1, 'theta': 45},
    ],
    load=[
        {'point': 0, 'Fx': 1, 'Fy': 1},
    ]
)

result = Calculation_Result_to_Visualization(test_data)

print(result)