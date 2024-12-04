from playwright.sync_api import sync_playwright
import re
import os
import requests
from datetime import datetime
import json
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# API 키 확인
kakao_api_key = os.getenv("KAKAO_API_KEY")
if not kakao_api_key:
    print("Kakao API Key가 로드되지 않았습니다.")
    exit(1)  # API 키가 없으면 프로그램 종료

def fetch_page(url):
    """URL에 GET 요청을 보내 HTML 응답을 반환"""
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
        else:
            print(f"페이지 요청 실패: {url}, 상태 코드: {response.status_code}")
            return None
    except Exception as e:
        print(f"페이지 요청 중 오류 발생: {e}")
        return None

def clean_location_for_geocoding(location):
    """위도/경도 검색용 단순 위치 데이터를 반환"""
    if not location or "정보 없음" in location:
        return None

    # 불필요한 텍스트 제거
    cleaned = re.search(r"^(.*?구\s*.*?로\s*\d+(?:번길)?(?:\s*\d+)?)", location)
    if not cleaned:
        cleaned = re.match(r"^(.*?([가-힣]+군|[가-힣]+읍|[가-힣]+로)\s*\d+(?:번길)?(?:\s*\d+)?)", location)
    if cleaned:
        # 여러 장소가 나열된 경우 첫 번째 장소만 사용
        return cleaned.group(1).strip()
    else:
        return None

def get_kakao_lat_lon(location_name):
    """카카오 API로 위도와 경도 가져오기"""
    headers = {"Authorization": f"KakaoAK {kakao_api_key}"}
    # 카카오 API URL에 쿼리 파라미터를 안전하게 추가
    #url = "https://dapi.kakao.com/v2/local/search/address.json"
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    params = {"query": location_name}  # 주소를 그대로 params에 추가

    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if data['documents']:
            location = data['documents'][0]
            latitude = location['y']  # 위도
            longitude = location['x']  # 경도
            return float(latitude), float(longitude)
        else:
            print(f"'{location_name}'에 대한 결과가 없습니다.")
    else:
        print(f"요청 실패: {response.status_code}, {response.text}")

    return None, None

def scrape_popup_info():
    with sync_playwright() as p:
        # 브라우저 실행
        browser = p.chromium.launch(headless=True)  # headless=True로 하면 브라우저 화면을 표시하지 않음
        page = browser.new_page()

        # 페이지 열기
        page.goto("https://www.popply.co.kr/popup/search?query=%EB%B6%80%EC%82%B0&status=all&fromDate=2024-12-04&toDate=2024-12-04")

        # 페이지가 완전히 로드될 때까지 대기
        page.wait_for_selector('.popup-name')  # 팝업 이름이 로드될 때까지 대기

        details = []
        popups = []

        popup_details = page.query_selector_all('a.popup-img-wrap') # 모든 팝업의 상세 페이지 주소
        for i in range(len(popup_details)):
            detail_url = popup_details[i].get_attribute('href')  # href 속성 추출

            details.append(detail_url)
        
        id = 1
        for i in range(len(details)):
            # 페이지 열기
            page.goto(f"https://www.popply.co.kr{details[i]}")

            # 페이지가 완전히 로드될 때까지 대기
            page.wait_for_selector('.tit')  # 팝업 이름이 로드될 때까지 대기

            # 팝업 정보 크롤링
            popup_names = page.query_selector('.tit').inner_text()  # 팝업 이름 추출
            popup_locations = page.query_selector('.location').inner_text()  # 팝업 위치 추출
            popup_dates = page.query_selector('.date').inner_text()  # 팝업 날짜 추출
            image_url = page.query_selector('.slide-img-wrap img').get_attribute('src')
            
            # 위도/경도 검색용 단순 위치 정제
            geocode_location = clean_location_for_geocoding(popup_locations)
            lat, lon = get_kakao_lat_lon(geocode_location)

            # 날짜 형식: 24.11.01 - 25.01.01, 24.12.01 - 24.12.31와 같은 날짜 범위
            match = re.match(r'(\d{2})\.(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})\.(\d{2})', popup_dates)
            if match:
                # 시작일과 종료일을 각각 날짜 객체로 변환
                start_date = f"20{match.group(1)}-{match.group(2)}-{match.group(3)}"
                end_date = f"20{match.group(4)}-{match.group(5)}-{match.group(6)}"

                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")

                # 12월에 포함된 날짜인지 확인
                if start_date_obj.month == 12 or end_date_obj.month == 12 or (start_date_obj.month < 12 < end_date_obj.month):
                    popups.append({
                        "id" : id,
                        "title" : popup_names,
                        "date": popup_dates,
                        "start_date": start_date_obj.strftime("%Y-%m-%d") if start_date_obj else None,
                        "end_date": end_date_obj.strftime("%Y-%m-%d") if end_date_obj else None,
                        "location": popup_locations,
                        "latitude": lat,
                        "longitude": lon,
                        "image_url": image_url,
                        
                    })
                    id += 1
                

        # JSON 파일 저장
        with open("popups.json", "w", encoding="utf-8") as f:
            json.dump(popups, f, ensure_ascii=False, indent=4)

        print("팝업 정보가 popups.json 파일에 저장되었습니다.")
        # 브라우저 종료
        browser.close()

# 실행
scrape_popup_info()
