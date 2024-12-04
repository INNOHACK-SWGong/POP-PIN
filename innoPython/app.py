from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import json
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/festivals', methods=['GET'])
def get_festivals():
    try:
        with open("festivals.json", "r", encoding="utf-8") as f:
            festivals = json.load(f)
        # JSON 데이터 UTF-8로 반환
        return Response(json.dumps(festivals, ensure_ascii=False, indent=4), content_type="application/json; charset=utf-8")
    except FileNotFoundError:
        return jsonify({"error": "JSON 파일을 찾을 수 없습니다. 먼저 크롤링을 실행하세요."}), 404

@app.route('/openai', methods=['POST'])
def process_festival_data():
    data = request.get_json()
    festival = data.get("festival")
    
    if not festival:
        return jsonify({"message": "축제 정보가 없습니다."}), 400

    # 예시: openai API를 사용하여 특정 작업을 처리하는 코드
    try:
        # 예시로 GPT-3를 사용하여 축제 관련 정보를 생성하는 코드
        response = openai.Completion.create(
            engine="text-davinci-003",  # 엔진 이름을 설정
            prompt=f"Tell me about the festival: {festival['title']}. It starts on {festival['start_date']} and ends on {festival['end_date']}.",
            max_tokens=100
        )
        return jsonify({"message": response.choices[0].text.strip()})
    except Exception as e:
        return jsonify({"message": f"OpenAI API 오류: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
