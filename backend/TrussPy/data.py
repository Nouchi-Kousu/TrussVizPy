import math
from .data_types import Calculation_Result_Data, Computational_Data, Frontend_Line, Visualization_Data, Line_Force, Line, Input_Data, Line_input, Frontend_Input_Data
from scipy.spatial.distance import euclidean


def Input_to_Computational_Data(input_data: Input_Data):
    points = input_data['points'].copy()

    def Line_Input_to_Line(line: Line_input) -> Line:
        start = points[line['points'][0]]
        end = points[line['points'][1]]
        theta = math.atan2(end['y'] - start['y'], end['x'] - start['x'])
        L = euclidean([start['x'], start['y']], [end['x'], end['y']])
        k = line['A'] * line['E'] / L
        m = line['rho'] * L * line['A']
        return Line(points=line['points'], L=L, E=line['E'], k=k, A=line['A'], theta=theta, m=m)

    lines = [Line_Input_to_Line(line_input)
             for line_input in input_data['lines']]

    return Computational_Data(
        constraint_nums=input_data['constraint_nums'],
        points=points,
        lines=lines,
        loads=input_data['loads']
    )


def Fronted_to_Computational_Data(frontend_input_data: Frontend_Input_Data):
    # 前端传入数据转为计算用数据
    points = frontend_input_data['points'].copy()
    makings = frontend_input_data['makings'].copy()

    def Line_to_Line_input(line: Frontend_Line) -> Line:
        start = points[line['points'][0]]
        end = points[line['points'][1]]
        theta = math.atan2(end['y'] - start['y'], end['x'] - start['x'])
        making = makings[line['makingsIdx']]
        L = euclidean([start['x'], start['y']], [end['x'], end['y']])
        k = making['A'] * making['E'] / L
        m = making['rho'] * L * making['A']
        return Line(points=line['points'], L=L, E=making['E'], k=k, A=making['A'], theta=theta, m=m)

    lines = [Line_to_Line_input(line)
             for line in frontend_input_data['lines']]
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
        return Line_Force(points=[line['points'][0], line['points'][1]], sigma=sigma)

    line_forces = [Line_to_Line_Force(line)
                   for line in calculation_result['lines']]

    visualization_data = Visualization_Data(
        points=calculation_result['points'].copy(),
        lines=line_forces,
        loads=calculation_result['loads']
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


def txt_to_frontend_input_data(file_path: str) -> Frontend_Input_Data:
    data: Frontend_Input_Data = {
        'points': [],
        'lines': [],
        'loads': [],
        'makings': []
    }

    with open(file_path, 'r') as f:
        for line in f:
            tokens = line.strip().split(',')
            if tokens[0] == 'P':
                # 解析点数据
                assert len(tokens) == 5
                data['points'].append({
                    'x': float(tokens[1]),
                    'y': float(tokens[2]),
                    'Constraint_Type': int(tokens[3]),
                    'theta': float(tokens[4])
                })
            elif tokens[0] == 'L':
                # 解析杆件数据
                assert len(tokens) == 4
                data['lines'].append({
                    'points': [int(tokens[1]), int(tokens[2])],
                    'makingsIdx': int(tokens[3])
                })
            elif tokens[0] == 'M':
                # 解析材料数据
                assert len(tokens) == 4
                data['makings'].append({
                    'E': float(tokens[1]),
                    'A': float(tokens[2]),
                    'rho': float(tokens[3])
                })
            elif tokens[0] == 'F':
                # 解析载荷数据
                assert len(tokens) == 4
                data['loads'].append({
                    'point': int(tokens[1]),
                    'Fx': float(tokens[2]),
                    'Fy': float(tokens[3])
                })

    return data
