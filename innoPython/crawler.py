import os
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
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
    cleaned = re.sub(r"(일원|일대|\(.+?\)|\d+[A-Za-z]*홀|\d+[A-Za-z]*층|\d+[A-Za-z]*호|및|\w*실)", "", location).strip()

    # 여러 장소가 나열된 경우 첫 번째 장소만 사용
    cleaned = cleaned.split(",")[0].strip()

    return cleaned

def get_kakao_lat_lon(location_name):
    """카카오 API로 위도와 경도 가져오기"""
    headers = {"Authorization": f"KakaoAK {kakao_api_key}"}
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    params = {"query": location_name}

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

def fetch_festival_details(detail_url):
    """상세 페이지에서 위치와 위도/경도를 추출"""
    original_location = "정보 없음"
    geocode_location = None
    lat, lon = None, None
    try:
        html = fetch_page(detail_url)
        if not html:
            return original_location, geocode_location, lat, lon

        detail_soup = BeautifulSoup(html, 'html.parser')
        location_tags = detail_soup.find_all(text=True)
        for text in location_tags:
            text_str = str(text)
            if re.search(r"장\s*소\s*:(.+)", text_str):
                original_location = re.search(r"장\s*소\s*:(.+)", text_str).group(1).strip()
                break

        # 위도/경도 검색용 단순 위치 정제
        geocode_location = clean_location_for_geocoding(original_location)

        # Kakao API를 사용하여 위도/경도 변환
        if geocode_location:
            lat, lon = get_kakao_lat_lon(geocode_location)
    except Exception as e:
        print(f"상세 페이지 요청 실패: {e}")

    return original_location, geocode_location, lat, lon

def crawl_festivals():
    """축제 정보를 크롤링하여 JSON 파일로 저장"""
    base_url = "https://www.visitbusan.net/schedule/list.do"
    festivals = []

    start_page = 1
    while True:
        list_url = f"{base_url}?startPage={start_page}&boardId=BBS_0000009&menuCd=DOM_000000204012000000&month=12&year=2024"
        print(f"요청 중: {list_url}")

        html = fetch_page(list_url)
        if not html:
            break

        soup = BeautifulSoup(html, 'html.parser')
        festival_div = soup.find('div', class_='newcalendar festival')
        if not festival_div:
            break

        festival_list = festival_div.find('ul', id='playlist').find_all('li')
        if not festival_list:
            print(f"페이지 {start_page}에 데이터 없음. 크롤링 종료.")
            break

        for festival in festival_list:
            title = festival.find('p', class_='tit').text.strip()
            title = re.sub(r"안내", "", title).strip()
            date = festival.find('p', class_='cont').text.strip()
            detail_url = "https://www.visitbusan.net" + festival.find('a')['href']
            image_url = "https://www.visitbusan.net" + festival.find('p', class_='imgwrap').find('img')['src']

            try:
                start_date, end_date = date.split(" ~ ")
                start_date_obj = datetime.strptime(start_date.strip(), "%Y-%m-%d")
                end_date_obj = datetime.strptime(end_date.strip(), "%Y-%m-%d")
            except Exception as e:
                print(f"날짜 처리 실패: {e}")
                start_date_obj, end_date_obj = None, None

            original_location, geocode_location, lat, lon = fetch_festival_details(detail_url)

            festivals.append({
                "title": title,
                "date": date,
                "start_date": start_date_obj.strftime("%Y-%m-%d") if start_date_obj else None,
                "end_date": end_date_obj.strftime("%Y-%m-%d") if end_date_obj else None,
                "original_location": original_location,
                "geocode_location": geocode_location,
                "latitude": lat,
                "longitude": lon,
                "image_url": image_url
            })

        start_page += 1

    # JSON 파일 저장
    with open("festivals.json", "w", encoding="utf-8") as f:
        json.dump(festivals, f, ensure_ascii=False, indent=4)

    print("축제 정보가 festivals.json 파일에 저장되었습니다.")

if __name__ == "__main__":
    crawl_festivals()
