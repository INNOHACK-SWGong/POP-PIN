from flask import Flask, jsonify, Response
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/festivals', methods=['GET'])
def get_festivals():
    try:
        with open("festivals.json", "r", encoding="utf-8") as f:
            festivals = json.load(f)
        # JSON 데이터 UTF-8로 반환
        return Response(json.dumps(festivals, ensure_ascii=False, indent=4), content_type="application/json; charset=utf-8")
    except FileNotFoundError:
        return jsonify({"error": "JSON 파일을 찾을 수 없습니다. 먼저 크롤링을 실행하세요."}), 404

if __name__ == '__main__':
    app.run(debug=True)
