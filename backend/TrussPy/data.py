from .data_types import Calculation_Result_Data, Visualization_Data, Line_Force, Line
from scipy.spatial.distance import euclidean


def Calculation_Result_to_Visualization(calculation_result: Calculation_Result_Data):
    points = calculation_result['point'].copy()

    def Line_to_Line_Force(line: Line) -> Line_Force:
        start = points[line['points'][0]]
        end = points[line['points'][1]]
        sigma = (euclidean([start['x'],start['y']], [end['x'],end['y']]) - line['L']) / line['L']
        return Line_Force(points=(line['points'][0],line['points'][1]), sigma=sigma)

    line_forces = [Line_to_Line_Force(line) for line in calculation_result['line']]

    visualization_data = Visualization_Data(
        point=calculation_result['point'].copy(),
        line=line_forces
    )

    return visualization_data

class Bidirectional_Map():
    def __init__(self):
        self.point_to_idx = {}
        self.idx_to_point = []

    def get_idx(self, point):
        if point in self.point_to_idx:
            return self.point_to_idx[point]
        else:
            self.point_to_idx[point] = len(self.idx_to_point)
            self.idx_to_point.append(point)
            return self.point_to_idx[point]

    def get_point(self, idx):
        return self.idx_to_point[idx]


if __name__ == '__main__':
    print('test')