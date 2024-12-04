import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
from geopy.geocoders import Nominatim

# Geolocator 초기화
geolocator = Nominatim(user_agent="geoapi")

def fetch_page(url):
    response = requests.get(url)
    return response.text if response.status_code == 200 else None

def fetch_festival_details(detail_url):
    location = "정보 없음"
    cleaned_location = None
    lat, lon = None, None
    try:
        html = fetch_page(detail_url)
        if not html:
            return location, lat, lon

        detail_soup = BeautifulSoup(html, 'html.parser')
        location_tags = detail_soup.find_all(text=True)
        for text in location_tags:
            text_str = str(text)
            if re.search(r"장\s*소\s*:(.+)", text_str):
                location = re.search(r"장\s*소\s*:(.+)", text_str).group(1).strip()
                break

        # "일원" 및 "일대" 제거
        if location:
            cleaned_location = re.sub(r"(일원|일대)", "", location).strip()

        # Geopy를 사용하여 위도/경도 변환
        geo = geolocator.geocode("부산 " + cleaned_location)
        if geo:
            lat, lon = geo.latitude, geo.longitude

    except Exception as e:
        print(f"위치 변환 실패 또는 상세 페이지 요청 실패: {e}")

    return cleaned_location or location, lat, lon

def crawl_festivals():
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
            break

        for festival in festival_list:
            title = festival.find('p', class_='tit').text.strip()
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

            location, lat, lon = fetch_festival_details(detail_url)

            festivals.append({
                "title": title,
                "date": date,
                "start_date": start_date_obj.strftime("%Y-%m-%d") if start_date_obj else None,
                "end_date": end_date_obj.strftime("%Y-%m-%d") if end_date_obj else None,
                "location": location,
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
