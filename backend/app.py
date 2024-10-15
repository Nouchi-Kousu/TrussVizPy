import math
from time import time
from matplotlib import pyplot as plt
import msgpack
import scipy
import scipy.linalg
from TrussPy import prepare_input, Point, Line, Load, Input_Data, Bidirectional_Map, Frontend_Line, Frontend_Input_Data, Visualization_Data
from rich import print
import TrussPy as tp
from flask import Flask, request


app = Flask(__name__)


@app.route("/api/get", methods=["GET"])  # type: ignore
def my_protobuf():
    packed_data = request.data
    data = msgpack.unpackb(packed_data)
    print(data)
    data = tp.prepare_frontend_input(data)
    try:
        resp = tp.main(data)
        packed_response = msgpack.packb(resp)
    except Exception as e:
        print(e)
        packed_response = msgpack.packb({"error": str(e)})
        return packed_response, 400, {'Content-Type': 'application/x-msgpack'}

    # 返回 MessagePack 编码的二进制数据
    return packed_response, 200, {'Content-Type': 'application/x-msgpack'}


if __name__ == '__main__':
    app.run()
