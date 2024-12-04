from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import json
import openai
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)

# OpenAI API 키 설정
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/festivals', methods=['GET'])
def get_festivals():
    try:
        # festivals.json 파일에서 축제 데이터 읽기
        with open("festivals.json", "r", encoding="utf-8") as f:
            festivals = json.load(f)
        
        # 축제 데이터를 JSON 형식으로 반환
        return jsonify(festivals), 200

    except Exception as e:
        # 에러 발생 시 메시지 반환
        return jsonify({"message": "축제 데이터를 가져오는 중 오류가 발생했습니다.", "error": str(e)}), 500

@app.route('/openai', methods=['POST'])
def process_festival_data():
    try:
        # POST 요청으로 받은 JSON 데이터 처리
        data = request.get_json()
        festival = data.get("festival")
        
        if not festival:
            return jsonify({"message": "축제 정보가 없습니다."}), 400

        # OpenAI API로 축제 데이터 처리 (예시: gpt-3.5-turbo 모델 사용)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # 사용하려는 모델
            messages=[
                {"role": "system", "content": "대한민국의 축제 데이터에 대한 분석을 진행합니다. (어떤 축제인가?, 무엇을 하나? 등등)"},
                {"role": "user", "content": f"{festival["start_date"]}부터 {festival["end_date"]}까지 {festival["location"]}에서 진행하는 {festival["title"]}"}
            ]
        )

        # OpenAI API로부터 받은 응답 반환
        return jsonify(response.choices[0].message["content"]), 200

    except Exception as e:
        return jsonify({"message": "OpenAI 처리 중 오류가 발생했습니다.", "error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
