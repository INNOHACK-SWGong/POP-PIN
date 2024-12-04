from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import json
import openai
import os
from dotenv import load_dotenv
import re

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
        with open("popups.json", "r", encoding="utf-8") as f:
            festivals = json.load(f)
        
        # 축제 데이터를 JSON 형식으로 반환
        return jsonify(festivals), 200

    except Exception as e:
        # 에러 발생 시 메시지 반환
        return jsonify({"message": "축제 데이터를 가져오는 중 오류가 발생했습니다.", "error": str(e)}), 500

@app.route('/festivals/<int:festival_id>', methods=['GET'])
def get_festival_by_id(festival_id):
    try:
        with open("popups.json", "r", encoding="utf-8") as f:
            festivals = json.load(f)
        
        # festivals.json에서 해당 id의 축제 찾기
        festival = next((fest for fest in festivals if fest['id'] == festival_id), None)
        
        if festival:
            return jsonify(festival), 200
        else:
            return jsonify({"message": "축제를 찾을 수 없습니다."}), 404

    except Exception as e:
        logging.error("Exception occurred:", exc_info=True)
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
                {"role": "user", "content": f"{festival['start_date']}부터 {festival['end_date']}까지 {festival['location']}에서 진행하는 {festival['title']}"}
            ]
        )

        # OpenAI API로부터 받은 응답 반환
        return jsonify(response.choices[0].message["content"]), 200

    except Exception as e:
        return jsonify({"message": "OpenAI 처리 중 오류가 발생했습니다.", "error": str(e)}), 500


@app.route('/search', methods=['POST'])
def search_festivals():
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({"message": "검색어가 제공되지 않았습니다."}), 400

        # festivals.json 파일에서 축제 데이터 읽기
        with open("popups.json", "r", encoding="utf-8") as f:
            festivals = json.load(f)

        # OpenAI를 활용하여 검색어와 관련된 축제 필터링
        festivals_str = "\n".join([f"{fest['title']} ({fest['date']}): {fest['location']}, id: {fest['id']}, image_url: {fest['image_url']}" for fest in festivals])

        print(festivals_str)
        prompt = f"""
        다음은 대한민국의 다양한 축제 목록입니다:

        {festivals_str}

        사용자로부터 받은 검색어는 '{query}'입니다. 이 검색어와 관련성이 높은 순서대로 축제들을 3~5개 정도 아래 JSON 형식으로 반환해주세요. 각 축제는 다음과 같은 필드를 가져야 합니다: title, date, start_date, end_date, location, geocode_location, latitude, longitude, image_url, id. 축제가 없으면 빈 배열([])을 반환해주세요. 관련이 없다면 선택하지 않아도 됩니다. 하지만 적어도 1개는 주도록 노력하세요.
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 유용한 도우미입니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )

        ai_response = response.choices[0].message["content"]

        # AI 응답에서 JSON 부분만 추출하기 위한 시도
        try:
            # JSON 블록 추출 (백틱 내부)
            json_match = re.search(r'```json\n(.*?)\n```', ai_response, re.DOTALL)
            if json_match:
                matching_festivals = json.loads(json_match.group(1))
            else:
                # 백틱이 없을 경우 전체를 JSON으로 시도
                matching_festivals = json.loads(ai_response)
        except json.JSONDecodeError:
            return jsonify({
                "message": "AI 응답을 파싱하는 중 오류가 발생했습니다.",
                "error": "응답이 유효한 JSON 형식이 아닙니다.",
                "ai_response": ai_response
            }), 500

        # 축제가 없을 경우 빈 배열을 반환하도록 확인
        if not isinstance(matching_festivals, list):
            return jsonify({
                "message": "AI 응답이 올바른 형식이 아닙니다.",
                "error": "응답이 배열 형식이 아닙니다.",
                "ai_response": ai_response
            }), 500

        return jsonify(matching_festivals), 200

    except Exception as e:
        return jsonify({"message": "검색 중 오류가 발생했습니다.", "error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
