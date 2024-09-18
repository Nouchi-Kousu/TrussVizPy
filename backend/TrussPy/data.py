from typing import List
import types
from scipy.spatial.distance import euclidean


def Calculation_Result_to_Visualization(calculation_result: types.Calculation_Result_Data):
    points = calculation_result['point'].copy()

    def Line_to_Line_Force(line: Line) -> Line_Force:
        start = points[line['start']]
        end = points[line['end']]
        sigma = (euclidean([start['x'],start['y']], [end['x'],end['y']]) - line['L']) / line['L']
        return Line_Force(start=line['start'], end=line['end'], sigma=sigma)

    line_forces = [Line_to_Line_Force(line) for line in calculation_result['line']]

    visualization_data: Visualization_Data = {
        'point': calculation_result['point'].copy(),
        'line': line_forces
    }

    return visualization_data


if __name__ == '__main__':
    print('test')