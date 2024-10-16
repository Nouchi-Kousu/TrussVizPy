import base64
import math
from time import sleep, time
from matplotlib import pyplot as plt
import msgpack
import scipy
import scipy.linalg
from TrussPy import prepare_input, Point, Line, Load, Input_Data, Bidirectional_Map, Frontend_Line, Frontend_Input_Data, Visualization_Data
from rich import print
import TrussPy as tp
from flask import Flask, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


@app.route("/api/get", methods=["GET"])  # type: ignore
def my_protobuf():
    packed_data_base64 = request.args.get('data')

    if not packed_data_base64:
        return "No data provided", 400

    packed_data = base64.b64decode(packed_data_base64)
    data = msgpack.unpackb(packed_data)
    data = tp.prepare_frontend_input(data)

    try:
        resp = tp.main(data)
    except Exception as e:
        print(e)
        packed_response = msgpack.packb({"error": str(e)})
        return packed_response, 400, {'Content-Type': 'application/x-msgpack'}

    response_data = {'status': 'success', 'received': resp}
    packed_response = msgpack.packb(response_data)
    # 返回 MessagePack 编码的二进制数据
    return packed_response, 200, {'Content-Type': 'application/x-msgpack'}


if __name__ == '__main__':
    app.run()
