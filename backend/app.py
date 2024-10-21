import base64
from io import BytesIO
import msgpack
from rich import print
import TrussPy as tp
from flask import Flask, Response, request
from flask_cors import CORS
from TrussPy import draw

app = Flask(__name__)
CORS(app)


@app.route("/api/post/show", methods=["POST"])  # type: ignore
def my_protobuf():
    packed_data = request.data  # 直接从请求体中获取 MessagePack 编码的二进制数据

    if not packed_data:
        return "No data provided", 400

    data = msgpack.unpackb(packed_data)
    try:
        data = tp.prepare_frontend_input(data)
        resp = tp.main(data)
    except Exception as e:
        print(e)
        packed_response = msgpack.packb({"error": str(e)})
        return packed_response, 400, {'Content-Type': 'application/x-msgpack'}

    response_data = {'status': 'success', 'received': resp}
    packed_response = msgpack.packb(response_data)
    # 返回 MessagePack 编码的二进制数据
    return packed_response, 200, {'Content-Type': 'application/x-msgpack'}


@app.route("/api/post/pdf", methods=["POST"])
def my_pdf():
    packed_data = request.data  # 直接从请求体中获取 MessagePack 编码的二进制数据

    if not packed_data:
        return "No data provided", 400

    data = msgpack.unpackb(packed_data)
    try:
        data = tp.prepare_frontend_input(data)
        resp = tp.main(data)
    except Exception as e:
        print(e)
        packed_response = msgpack.packb({"error": str(e)})
        return Response(packed_response, status=400, content_type='application/x-msgpack')

    pdf_buffer = BytesIO()
    draw.pdf(resp, data, pdf_buffer, 2000, 200)
    pdf_data = pdf_buffer.getvalue()

    packed_data = msgpack.packb(pdf_data)

    return Response(packed_data, content_type='application/msgpack')


if __name__ == '__main__':
    app.run(port=1224)
