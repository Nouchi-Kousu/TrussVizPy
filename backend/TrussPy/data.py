import math
from .data_types import Calculation_Result_Data, Computational_Data, Frontend_Line, Visualization_Data, Line_Force, Line, Input_Data, Line_input, Frontend_Input_Data
from scipy.spatial.distance import euclidean


def Input_to_Computational_Data(input_data: Input_Data):
    points = input_data['points'].copy()

    def Line_Input_to_Line(line_input: Line_input) -> Line:
        start = points[line_input['points'][0]]
        end = points[line_input['points'][1]]
        theta = math.atan2(end['y'] - start['y'], end['x'] - start['x'])
        L = euclidean([start['x'], start['y']], [end['x'], end['y']])
        k = line_input['A'] * line_input['E'] / L
        m = line_input['rho'] * L * line_input['A']
        return Line(points=line_input['points'], L=L, E=line_input['E'], k=k, theta=theta, m=m)

    lines = [Line_Input_to_Line(line_input)
             for line_input in input_data['lines']]

    return Computational_Data(
        constraint_nums=input_data['constraint_nums'],
        points=points,
        lines=lines,
        loads=input_data['loads']
    )

# TODO 前端传入数据转为计算用数据


def Fronted_to_Computational_Data(frontend_input_data: Frontend_Input_Data):
    points = frontend_input_data['points'].copy()
    makings = frontend_input_data['makings'].copy()

    def Line_to_Line_input(line_input: Frontend_Line) -> Line:
        start = points[line_input['points'][0]]
        end = points[line_input['points'][1]]
        theta = math.atan2(end['y'] - start['y'], end['x'] - start['x'])
        making = makings[line_input['makingsIdx']]
        L = euclidean([start['x'], start['y']], [end['x'], end['y']])
        k = making['A'] * making['E'] / L
        m = making['rho'] * L * making['A']
        return Line(points=line_input['points'], L=L, E=making['E'], k=k, theta=theta, m=m)

    lines = [Line_to_Line_input(line_input)
             for line_input in frontend_input_data['lines']]
    constraint_nums = 0
    for point in points:
        if point['Constraint_Type'] == 2:
            constraint_nums += 1

    return Computational_Data(
        constraint_nums=constraint_nums,
        points=points,
        lines=lines,
        loads=frontend_input_data['loads']
    )

def Calculation_Result_to_Visualization(calculation_result: Calculation_Result_Data):
    points = calculation_result['points'].copy()

    def Line_to_Line_Force(line: Line) -> Line_Force:
        start = points[line['points'][0]]
        end = points[line['points'][1]]
        sigma = (euclidean([start['x'] + start['dx'], start['y'] + start['dy']],
                 [end['x'] + end['dx'], end['y'] + end['dy']]) - line['L']) / line['L'] * line['E']
        return Line_Force(points=(line['points'][0], line['points'][1]), sigma=sigma)

    line_forces = [Line_to_Line_Force(line)
                   for line in calculation_result['lines']]

    visualization_data = Visualization_Data(
        points=calculation_result['points'].copy(),
        lines=line_forces
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

    def has_point(self, point):
        return point in self.point_to_idx

    def has_idx(self, idx):
        return idx < len(self.idx_to_point)


if __name__ == '__main__':
    print('test')
