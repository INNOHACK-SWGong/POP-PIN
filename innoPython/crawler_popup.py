import os
import requests
from bs4 import BeautifulSoup
import json
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# Kakao API 키 (이것은 선택 사항)
kakao_api_key = os.getenv("KAKAO_API_KEY")
if not kakao_api_key:
    print("Kakao API Key가 로드되지 않았습니다.")
    exit(1)

# 기본 페이지에서 팝업 리스트를 크롤링
def fetch_basic_page(url, params=None):
    """기본 페이지에서 팝업 리스트 가져오기"""
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.text
    else:
        print(f"페이지 로드 실패: {response.status_code}")
        return None

# 상세 페이지 크롤링
def fetch_detail_page(detail_url):
    """상세 페이지에서 팝업 세부 정보 가져오기"""
    response = requests.get(detail_url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        
        # 제목
        title = soup.find("h1", class_="tit").text.strip()
        
        # 날짜
        date = soup.find("p", class_="date").text.strip()
        
        # 위치
        location = soup.find("p", class_="location").text.strip()
        
        return {
            "title": title,
            "date": date,
            "location": location
        }
    else:
        print(f"상세 페이지 로드 실패: {response.status_code}")
        return None

# 기본 페이지에서 팝업 리스트 크롤링 후 상세 페이지 크롤링
def fetch_all_popups(base_url, params):
    """기본 페이지에서 팝업 리스트를 가져오고, 각 상세 페이지 정보를 크롤링"""
    # 기본 페이지 크롤링
    page_content = fetch_basic_page(base_url, params)
    if not page_content:
        return []

    soup = BeautifulSoup(page_content, "html.parser")

    # 팝업 리스트 추출 (정확한 클래스나 구조에 맞게 수정 필요)
    popup_items = soup.find_all("div", class_="popup-item")
    
    popups = []
    for item in popup_items:
        # 팝업 제목과 상세 페이지 링크 추출
        title = item.find("h2").text.strip()
        detail_link = item.find("a")["href"]
        
        # 상세 페이지 정보 크롤링
        detail_info = fetch_detail_page(detail_link)
        if detail_info:
            popups.append({
                "title": title,
                "detail": detail_info
            })
    
    return popups

# 크롤링할 URL과 파라미터
base_url = "https://www.popply.co.kr/popup"
params = {
    "fromDate": "2024-12-04",  # 시작 날짜
    "toDate": "2024-12-04",    # 종료 날짜
    "address1": "부산",         # 예시 검색어
}

# 팝업 데이터 크롤링
popups = fetch_all_popups(base_url, params)

# 결과 출력 및 저장
if popups:
    with open("popups.json", "w", encoding="utf-8") as f:
        json.dump(popups, f, ensure_ascii=False, indent=4)
    print("크롤링 완료, 팝업 정보가 popups.json에 저장되었습니다.")
else:
    print("팝업 정보를 찾을 수 없습니다.")