import msgpack
import requests
from TrussPy.data import Fronted_to_Computational_Data, txt_to_frontend_input_data
from TrussPy import Frontend_Input_Data, Point, Frontend_Line, Load
import math
from rich import print

truss: Frontend_Input_Data = {
    'points': [
        Point(0, 0, 2),
        Point(1, 0, 2),
        Point(0.5, math.sqrt(3)/6),
        Point(0.5, math.sqrt(3)/2)
    ],
    'lines': [
        Frontend_Line([0, 3], 0),
        Frontend_Line([2, 3], 0),
        Frontend_Line([1, 3], 0),
        Frontend_Line([0, 2], 0),
        Frontend_Line([2, 1], 0),
        Frontend_Line([0, 1], 0)
    ],
    'loads': [
        Load(3, 90.710, -70.710),
    ],
    'makings': [
        {'E': 48e5, 'A': 1, 'rho': 0}
    ]
}

packed_data = msgpack.packb(truss)
resp = requests.get("http://127.0.0.1:5000/api/get", data=packed_data)
resp_data = msgpack.unpackb(resp.content)
print(resp_data)
